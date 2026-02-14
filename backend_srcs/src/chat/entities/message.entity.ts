import { User } from "src/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, Index, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Conversation } from "./conversation.entity";
import { MessageReaction } from "./message-reaction.entity";


@Entity('messages')
export class Message {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'text' })
    content: string;

    @ManyToOne(() => User, (user) => user.messages)
    sender: User;
 
    @Index()
    @ManyToOne(() => Conversation, (conversation) => conversation.messages, { onDelete: 'CASCADE' })
    conversation: Conversation;
    
    @Index() 
    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(() => Message, { nullable: true, onDelete: 'SET NULL' })
    replyTo?: Message | null;

    @OneToMany(() => MessageReaction, (reaction) => reaction.message)
    reactions: MessageReaction[];
}