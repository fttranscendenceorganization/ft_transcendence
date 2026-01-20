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
    level: number;

    @Expose()
    points: number;

    @Expose()
    rank: string;

    @Expose()
    favouriteGame: string;

    @Expose()
    isActive: boolean;

    @Expose()
    createdAt: Date;

    @Expose()
    updatedAt: Date;

};