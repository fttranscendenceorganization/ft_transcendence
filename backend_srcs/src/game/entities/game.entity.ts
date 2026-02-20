import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { GameModeEnum } from "../types/game-mode.enum";
import { GameStatusEnum } from "../types/game-status.enum";
import { User } from "src/user/entities/user.entity";

@Entity('games')
export class Game
{
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({type: 'enum', enum: GameModeEnum})
    mode: GameModeEnum

    @Column({type: 'enum', enum: GameStatusEnum})
    status: GameStatusEnum

    @ManyToOne(() => User)
    playerA: User;

    @ManyToOne(() => User)
    playerB: User;

    @ManyToOne(() => User, { nullable: true })
    winner: User;

    @Column()
    playerAScore: number

    @Column()
    playerBScore: number

    @CreateDateColumn()
    createdAt: Date

}