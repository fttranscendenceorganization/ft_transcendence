import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { MessageReaction } from './entities/message-reaction.entity';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { UserModule } from 'src/user/user.module';
import { ChatGateway } from './chat.gateway';


@Module({
  
    imports: [
      TypeOrmModule.forFeature([Conversation, Message, MessageReaction]),
      UserModule
    ],
  
    controllers: [ChatController],

    providers: [ChatService, ChatGateway],

    exports: [] 
})
export class ChatModule {}