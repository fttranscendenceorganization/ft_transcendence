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
    firstname: string;

    @Column({nullable: true})
    lastname: string;

    @Column()
    @Exclude()
    password: string;

    @Column({nullable: true})
    avatarUrl: string;

    @Column({default: 0})
    wins: number;

    @Column({default: 0})
    losses: number;

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
        return bcrypt.compare(password, this.password);
    }



}