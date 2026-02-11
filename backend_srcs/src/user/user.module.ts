import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Block } from './entities/block.entity';
import { FriendRequest } from './entities/friend-request.entity';

@Module({
    imports : [TypeOrmModule.forFeature([User, Block, FriendRequest])],
    controllers : [UserController],
    providers : [UserService],
    exports : [UserService],
})

export class UserModule{};

