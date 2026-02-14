import { BadRequestException, ForbiddenException, Injectable, NotFoundException, InternalServerErrorException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Conversation } from "./entities/conversation.entity";
import { LessThan, Repository } from "typeorm";
import { Message } from "./entities/message.entity";
import { UserService } from "src/user/user.service";
import { User } from "src/user/entities/user.entity";
import { MessageReaction } from "./entities/message-reaction.entity";

@Injectable()
export class ChatService
{
    constructor (@InjectRepository(Conversation)
                private readonly conversationrepo: Repository<Conversation>,
                @InjectRepository(Message)
                private readonly messagerepo: Repository<Message>,
                @InjectRepository(MessageReaction)
                private readonly reactionRepo: Repository<MessageReaction>,
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

    async sendMessage(userId: string, conversationId: string, content: string, replyToMessageId?: string)
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

        let replyTo: Message | undefined;
        if (replyToMessageId) {
            replyTo = await this.messagerepo.findOne({
                where: { id: replyToMessageId },
                relations: ['conversation', 'sender'],
            }) || undefined;

            if (replyTo && replyTo.conversation.id !== conversationId) {
                throw new BadRequestException('Cannot reply to a message from another conversation');
            }
        }

        const message = this.messagerepo.create({
            content,
            conversation,
            sender: user,
            replyTo: replyTo ?? null,
        });

        const savedMessage = await this.messagerepo.save(message);

        const full = await this.messagerepo.findOne({
            where: { id: savedMessage.id },
            relations: ['sender', 'replyTo', 'replyTo.sender', 'reactions', 'reactions.user'],
        });

        if (!full)
            throw new InternalServerErrorException('Failed to load saved message');

        return {
            id: full.id,
            content: full.content,
            createdAt: full.createdAt,
            sender: {
                id: full.sender.id,
                username: full.sender.username,
                avatarUrl: full.sender.avatarUrl,
            },
            replyTo: full.replyTo
                ? {
                    id: full.replyTo.id,
                    content: full.replyTo.content,
                    sender: {
                        id: full.replyTo.sender.id,
                        username: full.replyTo.sender.username,
                    },
                }
                : null,
            reactions: (full.reactions || []).map((r) => ({
                id: r.id,
                emoji: r.emoji,
                user: {
                    id: r.user.id,
                    username: r.user.username,
                },
            })),
        };
    }

    async getMessages(userId: string, conversationId: string, before?: Date, limit: number = 50)
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

        const where: any = { conversation: { id: conversationId } };

        if (before) {
            where.createdAt = LessThan(before);
        }

        const messages = await this.messagerepo.find({
            where,
            relations: ['sender', 'replyTo', 'replyTo.sender', 'reactions', 'reactions.user'],
            order: { createdAt: 'DESC' },
            take: limit,
        });
        const ordered = messages.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

        return ordered.map(msg => ({
            id: msg.id,
            content: msg.content,
            createdAt: msg.createdAt,
            sender: {
                id: msg.sender.id,
                username: msg.sender.username,
                avatarUrl: msg.sender.avatarUrl,
            },
            replyTo: msg.replyTo
                ? {
                    id: msg.replyTo.id,
                    content: msg.replyTo.content,
                    sender: {
                        id: msg.replyTo.sender.id,
                        username: msg.replyTo.sender.username,
                    },
                }
                : null,
            reactions: (msg.reactions || []).map((r) => ({
                id: r.id,
                emoji: r.emoji,
                user: {
                    id: r.user.id,
                    username: r.user.username,
                },
            })),
        }));
    }

    async toggleReaction(userId: string, messageId: string, emoji: string) {
        if (!emoji || !emoji.trim()) {
            throw new BadRequestException('Emoji is required');
        }

        const message = await this.messagerepo.findOne({
            where: { id: messageId },
            relations: ['conversation', 'conversation.participants'],
        });

        if (!message)
            throw new NotFoundException('Message not found');

        const conversation = message.conversation;
        const isMember = conversation.participants.some(p => p.id === userId);
        if (!isMember) {
            throw new ForbiddenException('You are not a member of this chat');
        }

        const user = await this.userService.findById(userId);
        if (!user)
            throw new NotFoundException('User not found');

        const existing = await this.reactionRepo.findOne({
            where: {
                message: { id: messageId },
                user: { id: userId },
                emoji,
            },
            relations: ['message', 'user'],
        });

        if (existing) {
            await this.reactionRepo.remove(existing);
        } else {
            const reaction = this.reactionRepo.create({
                message,
                user,
                emoji,
            });
            await this.reactionRepo.save(reaction);
        }

        const updated = await this.messagerepo.findOne({
            where: { id: messageId },
            relations: ['reactions', 'reactions.user', 'conversation'],
        });

        if (!updated)
            throw new InternalServerErrorException('Failed to load updated reactions');

        return {
            messageId: updated.id,
            conversationId: updated.conversation.id,
            reactions: (updated.reactions || []).map((r) => ({
                id: r.id,
                emoji: r.emoji,
                user: {
                    id: r.user.id,
                    username: r.user.username,
                },
            })),
        };
    }

}