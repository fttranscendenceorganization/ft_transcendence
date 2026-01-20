import { Exclude } from 'class-transformer';
import {  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BeforeInsert, BeforeUpdate } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Entity('users')

export class User
{
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({unique: true})
    email: string;

    @Column({unique: true, length : 20})
    username: string;

    @Column({nullable: true})
    firstName: string;

    @Column({nullable: true})
    lastName: string;

    @Column({ unique: true, nullable: true, type: 'varchar' })
    googleId: string | null;

    @Column({ unique: true, nullable: true, type: 'varchar' })
    githubId: string | null;

    @Column({ unique: true, nullable: true, type: 'varchar' })
    intra42Id: string | null;

    @Column({ nullable: true })
    @Exclude()
    password: string;

    @Column({ type: 'text', nullable: true })
    refreshTokenHash: string | null;

   @Column({ type: 'text', nullable: true })
    avatarUrl: string | null;

    @Column({default: 0})
    wins: number;

    @Column({default: 0})
    losses: number;

    @Column({default: 1})
    level: number;

    @Column({default: 0})
    points: number;

    @Column({ type: 'varchar', nullable: true })
    rank: string | null;

    @Column({ type: 'varchar', nullable: true })
    favouriteGame: string | null;

    @Column({default: true})
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @BeforeInsert()
    @BeforeUpdate()
    async hashPassword()
    {
        if (this.password && !this.password.startsWith('$2b$'))
        {
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
        }
    }

    @BeforeInsert()
    @BeforeUpdate()
    normalizeFields()
    {
        if (this.email)
            this.email = this.email.toLowerCase().trim();
        if (this.username)
            this.username = this.username.toLowerCase().trim();
    }

    async validatePassword(password: string): Promise<boolean>
    {
        return await bcrypt.compare(password, this.password);
    }



}