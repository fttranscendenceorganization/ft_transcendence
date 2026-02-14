import { User } from "src/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Message } from "./message.entity";

@Entity('message_reactions')
export class MessageReaction {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Message, (message) => message.reactions, { onDelete: 'CASCADE' })
    message: Message;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    user: User;

    @Column({ type: 'varchar', length: 16 })
    emoji: string;

    @CreateDateColumn()
    createdAt: Date;
}
