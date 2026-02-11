import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, Unique, Column } from 'typeorm';
import { User } from './user.entity';

@Entity('blocks')
@Unique(['blockerId', 'blockedId'])
export class Block {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  blockerId: string;

  @Column()
  blockedId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'blockerId' })
  blocker: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'blockedId' })
  blocked: User;

  @CreateDateColumn()
  createdAt: Date;
}