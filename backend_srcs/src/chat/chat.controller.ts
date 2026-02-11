import { Body, Controller, Get, Post, UseGuards, InternalServerErrorException, Logger, Param, BadRequestException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/common/get-usr.decorator';
import { CreateDmDto } from './dto/create-dm.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController
{
  private readonly logger = new Logger(ChatController.name);
  
  constructor(private readonly chatService: ChatService) {}

  @Get('users')
  @UseGuards(AuthGuard('jwt'))
  async getUsers(@CurrentUser('id') userId: string)
  {
    return this.chatService.getAllUsersExcept(userId);
  }

  @Get('conversations')
  getConversations()
  {
    return [];
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('global')
  async getGlobalConversation(@CurrentUser('id') userId: string)
  {
    try {
      this.logger.log(`Getting/creating global conversation for user: ${userId}`);
      const conversation = await this.chatService.findOrCreateGlobalConversation();

      if (!conversation)
        throw new InternalServerErrorException('Failed to create or find global conversation');

      return {
        conversationId: conversation.id,
        name: conversation.name ?? 'Global Chat',
      };
    } catch (error) {
      this.logger.error(`Error in getGlobalConversation: ${error.message}`, error.stack);
      throw error;
    }
  }
 
  @UseGuards(AuthGuard('jwt'))
  @Post('conversations/dm')
  async Get_CreateDm(@CurrentUser('id') userId: string, @Body() dto: CreateDmDto)
  {
    try {
      this.logger.log(`Creating/finding DM conversation: user=${userId}, recipient=${dto.recipientId}`);
      
      const conversation = await this.chatService.FindOrCreateDm(userId, dto.recipientId);
      
      if (!conversation) {
        this.logger.error('Failed to create or find conversation - conversation is null');
        throw new InternalServerErrorException('Failed to create or find conversation');
      }
      
      if (!conversation.participants || conversation.participants.length === 0) {
        this.logger.error('Conversation has no participants loaded');
        throw new InternalServerErrorException('Conversation participants not loaded');
      }
      
      const recipient = conversation.participants.find(p => p.id !== userId);
      
      if (!recipient) {
        this.logger.error(`Recipient not found in conversation. Participants: ${conversation.participants.map(p => p.id).join(', ')}`);
        throw new InternalServerErrorException('Recipient not found in conversation');
      }
      
      this.logger.log(`Successfully created/found DM conversation: ${conversation.id}`);
      
      return {
        conversationId: conversation.id,
        recipient: {
          id: recipient.id,
          username: recipient.username,
        }
      };
    } catch (error) {
      this.logger.error(`Error in Get_CreateDm: ${error.message}`, error.stack);
      throw error;
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('conversations/:conversationId/messages')
  async getMessages(
    @CurrentUser('id') userId: string,
    @Param('conversationId') conversationId: string
  )
  {
    try {
      this.logger.log(`Getting messages for conversation: ${conversationId}, user: ${userId}`);
      return await this.chatService.getMessages(userId, conversationId);
    } catch (error) {
      this.logger.error(`Error in getMessages: ${error.message}`, error.stack);
      throw error;
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('messages')
  async sendMessage(
    @CurrentUser('id') userId: string,
    @Body() dto: SendMessageDto
  )
  {
    try {
      this.logger.log(`Sending message: user=${userId}, conversation=${dto.conversationId}`);
      
      if (!dto.content || !dto.content.trim()) {
        throw new BadRequestException('Message content cannot be empty');
      }
      
      return await this.chatService.sendMessage(userId, dto.conversationId, dto.content);
    } catch (error) {
      this.logger.error(`Error in sendMessage: ${error.message}`, error.stack);
      throw error;
    }
  }
}
