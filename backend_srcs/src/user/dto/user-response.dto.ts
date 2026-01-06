import { Expose } from "class-transformer";

export class UserResponseDto
{
    @Expose()
    id: string;

    @Expose()
    email: string;

    @Expose()
    username: string;

    @Expose()
    firstName: string;

    @Expose()
    lastName: string;

    @Expose()
    avatarUrl: string;

    @Expose()
    wins: number;

    @Expose()
    losses: number;

    @Expose()
    isActive: boolean;

    @Expose()
    createdAt: Date;

    @Expose()
    updatedAt: Date;

};