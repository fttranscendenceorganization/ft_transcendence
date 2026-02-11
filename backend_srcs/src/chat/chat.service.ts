import { BadRequestException, ForbiddenException, Injectable, NotFoundException, InternalServerErrorException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Conversation } from "./entities/conversation.entity";
import { Repository } from "typeorm";
import { Message } from "./entities/message.entity";
import { UserService } from "src/user/user.service";
import { User } from "src/user/entities/user.entity";

@Injectable()
export class ChatService
{
    constructor (@InjectRepository(Conversation)
                private readonly conversationrepo: Repository<Conversation>,
                @InjectRepository(Message)
                private readonly messagerepo: Repository<Message>,
                private readonly userService: UserService
            ){}

    async findOrCreateGlobalConversation(): Promise<Conversation>
    {
        let conversation = await this.conversationrepo.findOne({
            where: { isGroup: true, name: 'global' },
            relations: ['participants'],
        });

        if (!conversation)
        {
            const newConversation = this.conversationrepo.create({
                isGroup: true,
                name: 'global',
                participants: [],
            });

            const saved = await this.conversationrepo.save(newConversation);

            conversation = await this.conversationrepo.findOne({
                where: { id: saved.id },
                relations: ['participants'],
            });
        }

        if (!conversation)
            throw new InternalServerErrorException('Failed to create or load global conversation');

        return conversation;
    }

    async findDmConversation(userId: string, recipientId: string): Promise<Conversation | null>
    {
        
        const userConversations = await this.conversationrepo.find({
            where: { isGroup: false },
            relations: ['participants'],
        });

        
        const found = userConversations.find(conv => {
            const participantIds = conv.participants.map(p => p.id).sort();
            const targetIds = [userId, recipientId].sort();
            return participantIds.length === 2 && 
                   participantIds[0] === targetIds[0] && 
                   participantIds[1] === targetIds[1];
        });

        return found || null;
    }

    

    async FindOrCreateDm(userId: string, recipientId: string): Promise<Conversation | null>
    {
        console.log('FindOrCreateDm called with:', { userId, recipientId });
        
        if (!userId || userId === '0' || userId === 'undefined') {
            throw new BadRequestException('Invalid user ID');
        }
        
        if (!recipientId || recipientId === '0' || recipientId === 'undefined') {
            throw new BadRequestException('Invalid recipient ID');
        }
        
        if (userId == recipientId)
            throw new BadRequestException('You cannot start a conversation with yourself.');

        const recipient = await this.userService.findById(recipientId);
        if (!recipient)
            throw new NotFoundException('User not found');

        const existingConversation = await this.findDmConversation(userId, recipientId);
        if (existingConversation)
            return existingConversation;

    
        const blockStatus = await this.userService.checkBlockStatus(userId, recipientId);
        if (blockStatus === 'SENT_BY_ME')
            throw new BadRequestException('You must unblock this user to message them.');

        if (blockStatus === 'SENT_BY_THEM')
            throw new ForbiddenException('You cannot message this user.');

        const sender = await this.userService.findById(userId);
        if (!sender)
            throw new NotFoundException('Sender user not found');
        
        const newChat = this.conversationrepo.create({
            isGroup: false,
            participants: [sender, recipient],
        });    
            
        const savedChat = await this.conversationrepo.save(newChat);
        
        return await this.conversationrepo.findOne({
            where: { id: savedChat.id },
            relations: ['participants'],
        });
    }

    async findConversation(conversationId: string): Promise<Conversation | null>
    {
        const found = await this.conversationrepo.findOne({
            where : { id:  conversationId },
            relations : ['participants']

        });
        return found;
    }
    
    async getAllUsersExcept(currentUserId: string)
    {
        const result = await this.userService.findAll();
        return result.items
            .filter(u => u.id !== currentUserId)
            .map(u => ({
                id: u.id,
                username: u.username,
                isOnline: false
            }));
    }

    async sendMessage(userId: string, conversationId: string, content: string)
    {
        const conversation = await this.findConversation(conversationId);
        if (!conversation)
            throw new NotFoundException('Conversation not found');

        let isMember = conversation?.participants.some(user => user.id === userId);

        if (!isMember)
        {
            if (conversation.isGroup)
            {
                const user = await this.userService.findById(userId);
                if (!user)
                    throw new NotFoundException('Sender user not found');

                conversation.participants = [...(conversation.participants || []), user];
                await this.conversationrepo.save(conversation);
                isMember = true;
            }
            else
            {
                throw new ForbiddenException('You are not a member of this chat');
            }
        }

        if (!conversation.isGroup && conversation.participants && conversation.participants.length === 2)
        {
            const otherParticipant = conversation.participants.find(p => p.id !== userId);
            if (otherParticipant)
            {
                const blockStatus = await this.userService.checkBlockStatus(userId, otherParticipant.id);

                if (blockStatus === 'SENT_BY_ME')
                    throw new BadRequestException('You must unblock this user to message them.');

                if (blockStatus === 'SENT_BY_THEM')
                    throw new ForbiddenException('You cannot message this user.');
            }
        }

        const user = await this.userService.findById(userId);
        if (!user)
            throw new NotFoundException('Sender user not found');

        const message = this.messagerepo.create({
            content,
            conversation,
            sender: user,
        });

        const savedMessage = await this.messagerepo.save(message);
        
        return {
            id: savedMessage.id,
            content: savedMessage.content,
            createdAt: savedMessage.createdAt,
            sender: {
                id: user.id,
                username: user.username,
            }
        };
    }

    async getMessages(userId: string, conversationId: string)
    {
        const conversation = await this.findConversation(conversationId);
        if (!conversation)
            throw new NotFoundException('Conversation not found');

        let isMember = conversation.participants.some(user => user.id === userId);

        if (!isMember)
        {
            if (conversation.isGroup)
            {
                const user = await this.userService.findById(userId);
                if (!user)
                    throw new NotFoundException('User not found');

                conversation.participants = [...(conversation.participants || []), user];
                await this.conversationrepo.save(conversation);
                isMember = true;
            }
            else
            {
                throw new ForbiddenException('You are not a member of this chat');
            }
        }

        const messages = await this.messagerepo.find({
            where: { conversation: { id: conversationId } },
            relations: ['sender'],
            order: { createdAt: 'ASC' },
        });

        return messages.map(msg => ({
            id: msg.id,
            content: msg.content,
            createdAt: msg.createdAt,
            sender: {
                id: msg.sender.id,
                username: msg.sender.username,
            }
        }));
    }

}