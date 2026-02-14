import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Unique } from 'typeorm';
import { User } from './user.entity';

export type FriendRequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

@Entity('friend_requests')
@Unique(['requesterId', 'receiverId'])
export class FriendRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  requesterId: string;

  @Column()
  receiverId: string;

  @Column({ type: 'varchar', default: 'PENDING' })
  status: FriendRequestStatus;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'requesterId' })
  requester: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'receiverId' })
  receiver: User;

  @CreateDateColumn()
  createdAt: Date;
}
