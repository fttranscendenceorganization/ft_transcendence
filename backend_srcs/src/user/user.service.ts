import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { In, Not, Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Block } from "./entities/block.entity";
import { FriendRequest } from "./entities/friend-request.entity";
import { Logger } from "nestjs-pino";
import { MetricsService } from "src/metrics/metrics.service";
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User) private readonly userrepo: Repository<User>,
        @InjectRepository(Block) private readonly blockrepo: Repository<Block>,
        @InjectRepository(FriendRequest) private readonly friendRequestRepo: Repository<FriendRequest>,
        private readonly logger: Logger,
        private readonly metricsService: MetricsService,
    ) {}

    async findAll(page = 1, limit = 20): Promise<{ items: User[]; total: number }> {
        const maxLimit = 100;
        const take = Math.min(limit, maxLimit);
        const skip = (Math.max(page, 1) - 1) * take;

        const [items, total] = await this.userrepo.findAndCount({
            where: { isActive: true },
            take,
            skip,
            order: { level: 'DESC', totalXp: 'DESC' },
        });
        return { items, total };
    }

    async findByUsername(username: string): Promise<User | null> {
        return await this.userrepo.findOne({ where: { username, isActive: true } });
    }

    async findById(id: string): Promise<User | null> {
        return await this.userrepo.findOne({ where: { id, isActive: true } });
    }

    async findByEmail(email: string): Promise<User | null> {
        return await this.userrepo.findOne({ where: { email, isActive: true } });
    }

    async findByGoogleId(googleId: string): Promise<User | null> {
        return await this.userrepo.findOne({ where: { googleId, isActive: true } });
    }

    async findByGithubId(githubId: string): Promise<User | null> {
        return await this.userrepo.findOne({ where: { githubId, isActive: true } });
    }

    async findByIntra42Id(intra42Id: string): Promise<User | null> {
        return await this.userrepo.findOne({ where: { intra42Id, isActive: true } });
    }

    async updateGoogleUser(user: User, googleId: string, avatarUrl: string | null): Promise<User> {
        user.googleId = googleId;
        user.avatarUrl = avatarUrl;
        return await this.userrepo.save(user);
    }

    async updateGithubUser(user: User, githubId: string, avatarUrl: string | null): Promise<User> {
        user.githubId = githubId;
        user.avatarUrl = avatarUrl;
        return await this.userrepo.save(user);
    }

    async updateIntra42User(user: User, intra42Id: string, avatarUrl: string | null): Promise<User> {
        user.intra42Id = intra42Id;
        user.avatarUrl = avatarUrl;
        return await this.userrepo.save(user);
    }

    async updateRefreshToken(userId: string, refreshTokenHashed: string | null) {
        const user = await this.findById(userId);
        if (!user)
            throw new NotFoundException(`User with ID ${userId} not found`);
        user.refreshTokenHash = refreshTokenHashed;
        await this.userrepo.save(user);
    }

    async setResetPasswordToken(user: User, tokenHash: string, expiresAt: Date): Promise<void> {
        user.resetPasswordTokenHash = tokenHash;
        user.resetPasswordExpiresAt = expiresAt;
        await this.userrepo.save(user);
    }

    async clearResetPasswordToken(user: User): Promise<void> {
        user.resetPasswordTokenHash = null;
        user.resetPasswordExpiresAt = null;
        await this.userrepo.save(user);
    }

    async findByResetPasswordTokenHash(tokenHash: string): Promise<User | null> {
        return await this.userrepo.findOne({
            where: { resetPasswordTokenHash: tokenHash, isActive: true },
        });
    }

    async updatePasswordAfterReset(user: User, newPassword: string): Promise<void> {
        user.password = newPassword;
        user.refreshTokenHash = null;
        user.resetPasswordTokenHash = null;
        user.resetPasswordExpiresAt = null;
        await this.userrepo.save(user);
    }

    async createGoogleUser(data: {
        googleId: string;
        email: string;
        username: string;
        firstName: string;
        lastName: string;
        avatarUrl: string | null;
    }): Promise<User> {
        const user = this.userrepo.create(data);
        try {
            const saved = await this.userrepo.save(user);
            this.logger.log('Google user created', { context: 'UserService', userId: saved.id });
            this.metricsService.incrementUserRegistrations();
            return saved;
        } catch (error) {
            this.logger.error('Failed to create Google user', { context: 'UserService', error });
            throw new InternalServerErrorException('Failed to create user account');
        }
    }

    async createGithubUser(data: {
        githubId: string;
        email: string;
        username: string;
        firstName: string;
        lastName: string;
        avatarUrl: string | null;
    }): Promise<User> {
        const user = this.userrepo.create(data);
        try {
            const saved = await this.userrepo.save(user);
            this.logger.log('Github user created', { context: 'UserService', userId: saved.id });
            this.metricsService.incrementUserRegistrations();
            return saved;
        } catch (error) {
            this.logger.error('Failed to create Github user', { context: 'UserService', error });
            throw new InternalServerErrorException('Failed to create user account');
        }
    }

    async createIntra42User(data: {
        intra42Id: string;
        email: string;
        username: string;
        firstName: string;
        lastName: string;
        avatarUrl: string | null;
    }): Promise<User> {
        const user = this.userrepo.create(data);
        try {
            const saved = await this.userrepo.save(user);
            this.logger.log('Intra42 user created', { context: 'UserService', userId: saved.id });
            this.metricsService.incrementUserRegistrations();
            return saved;
        } catch (error) {
            this.logger.error('Failed to create Intra42 user', { context: 'UserService', error });
            throw new InternalServerErrorException('Failed to create user account');
        }
    }

    async createUser(createUserDto: CreateUserDto) {
        const existusername = await this.findByUsername(createUserDto.username.toLowerCase().trim());
        if (existusername)
            throw new ConflictException(`Username ${createUserDto.username} already exists`);

        const existemail = await this.findByEmail(createUserDto.email.toLowerCase().trim());
        if (existemail)
            throw new ConflictException(`Email ${createUserDto.email} already exists`);

        const user = this.userrepo.create(createUserDto);

        try {
            const saved = await this.userrepo.save(user);
            this.logger.log('Local user created', { context: 'UserService', userId: saved.id });
            this.metricsService.incrementUserRegistrations();
            return saved;
        } catch (error) {
            if (error.code === '23505')
                throw new ConflictException('Username or email already exists');
            throw error;
        }
    }

    async updateUserAfterGame(winnerId: string, loserId: string, winnerScore: number, loserScore: number, GameMode: string) {
        const winner = await this.findById(winnerId);
        const loser = await this.findById(loserId);
        if (!winner || !loser)
            throw new NotFoundException("One or more users not found");

        const winXP = Math.max(10, 20 + (winnerScore - loserScore) * 5);
        const loseXP = loserScore * 0.5;

        winner.wins += 1;
        winner.totalXp += winXP;
        winner.points += winXP;

        while (winner.points >= winner.level * 100) {
            winner.points -= winner.level * 100;
            winner.level += 1;
        }

        winner.winrate = (winner.wins + winner.losses > 0 ? Math.round((winner.wins / (winner.wins + winner.losses)) * 100) : 0);

        loser.losses += 1;
        loser.totalXp += loseXP;
        loser.points += loseXP;

        while (loser.points >= loser.level * 100) {
            loser.points -= loser.level * 100;
            loser.level += 1;
        }

        loser.winrate = (loser.wins + loser.losses > 0 ? Math.round((loser.wins / (loser.wins + loser.losses)) * 100) : 0);
        await this.userrepo.save([winner, loser]);
    }

    async checkBlockStatus(senderId: string, recipientId: string) {
        const block = await this.blockrepo
            .createQueryBuilder('block')
            .where('(block.blockerId = :senderId AND block.blockedId = :recipientId)', { senderId, recipientId })
            .orWhere('(block.blockerId = :recipientId AND block.blockedId = :senderId)', { senderId, recipientId })
            .getOne();

        if (!block) return null;
        return block.blockerId === senderId ? 'SENT_BY_ME' : 'SENT_BY_THEM';
    }

    async blockUser(blockerId: string, blockedId: string): Promise<void> {
        if (blockerId === blockedId)
            throw new BadRequestException('You cannot block yourself');

        const existing = await this.blockrepo.findOne({ where: { blockerId, blockedId } });
        if (existing) return;

        const block = this.blockrepo.create({ blockerId, blockedId });

        try {
            await this.blockrepo.save(block);
            this.logger.log('User blocked', { context: 'UserService', blockerId, blockedId });
        } catch (error) {
            throw new InternalServerErrorException('Failed to block user');
        }
    }

    async unblockUser(blockerId: string, blockedId: string): Promise<void> {
        await this.blockrepo.delete({ blockerId, blockedId });
        this.logger.log('User unblocked', { context: 'UserService', blockerId, blockedId });
    }

    async getBlockedUsers(blockerId: string): Promise<User[]> {
        const blocks = await this.blockrepo.find({
            where: { blockerId },
            relations: ['blocked'],
        });

        return blocks.map((block) => block.blocked).filter((user): user is User => !!user);
    }

    async sendFriendRequest(requesterId: string, targetUsername: string) {
        const requester = await this.findById(requesterId);
        if (!requester)
            throw new NotFoundException('Requester not found');

        const normalizedUsername = targetUsername.toLowerCase().trim();
        const target = await this.findByUsername(normalizedUsername);
        if (!target)
            throw new NotFoundException('User not found');

        if (target.id === requesterId)
            throw new BadRequestException('You cannot add yourself as a friend');

        const blockStatus = await this.checkBlockStatus(requesterId, target.id);
        if (blockStatus === 'SENT_BY_ME')
            throw new BadRequestException('You must unblock this user before sending a friend request');
        if (blockStatus === 'SENT_BY_THEM')
            throw new BadRequestException('You cannot send a friend request to this user');

        const existing = await this.friendRequestRepo.findOne({
            where: [
                { requesterId: requesterId, receiverId: target.id },
                { requesterId: target.id, receiverId: requesterId },
            ],
        });

        if (existing) {
            if (existing.status === 'ACCEPTED')
                throw new BadRequestException('You are already friends with this user');

            if (existing.status === 'PENDING') {
                if (existing.requesterId === requesterId)
                    throw new BadRequestException('Friend request already sent');

                existing.status = 'ACCEPTED';
                return await this.friendRequestRepo.save(existing);
            }

            if (existing.status === 'REJECTED') {
                existing.status = 'PENDING';
                existing.requesterId = requesterId;
                existing.receiverId = target.id;
                return await this.friendRequestRepo.save(existing);
            }
        }

        const friendRequest = this.friendRequestRepo.create({
            requesterId,
            receiverId: target.id,
            status: 'PENDING',
        });

        this.logger.log('Friend request sent', { context: 'UserService', requesterId, targetId: target.id });
        return await this.friendRequestRepo.save(friendRequest);
    }

    async getFriends(userId: string): Promise<User[]> {
        const requests = await this.friendRequestRepo.find({
            where: [
                { requesterId: userId, status: 'ACCEPTED' },
                { receiverId: userId, status: 'ACCEPTED' },
            ],
        });

        if (!requests.length) return [];

        const friendIds = requests.map((req) =>
            req.requesterId === userId ? req.receiverId : req.requesterId,
        );

        const uniqueFriendIds = Array.from(new Set(friendIds));
        return await this.userrepo.find({ where: { id: In(uniqueFriendIds), isActive: true } });
    }

    async getIncomingFriendRequests(userId: string) {
        return await this.friendRequestRepo.find({
            where: { receiverId: userId, status: 'PENDING' },
            relations: ['requester'],
            order: { createdAt: 'DESC' },
        });
    }

    async respondToFriendRequest(userId: string, requestId: string, action: 'ACCEPT' | 'REJECT') {
        const request = await this.friendRequestRepo.findOne({
            where: { id: requestId, receiverId: userId },
        });

        if (!request)
            throw new NotFoundException('Friend request not found');

        if (request.status !== 'PENDING')
            throw new BadRequestException('Friend request already processed');

        if (action === 'ACCEPT')
            request.status = 'ACCEPTED';
        else if (action === 'REJECT')
            request.status = 'REJECTED';
        else
            throw new BadRequestException('Invalid action');

        this.logger.log('Friend request responded', { context: 'UserService', userId, requestId, action });
        return await this.friendRequestRepo.save(request);
    }

    async updateProfile(userId: string, dto: UpdateProfileDto, avatarFile?: Express.Multer.File): Promise<User> {
        const user = await this.findById(userId);
        if (!user)
            throw new NotFoundException('User not found');

        if (dto.username && dto.username.toLowerCase().trim() !== user.username) {
            const existing = await this.userrepo.findOne({
                where: { username: dto.username.toLowerCase().trim(), id: Not(userId) },
            });
            if (existing)
                throw new ConflictException('Username already taken');
            user.username = dto.username;
        }

        if (dto.firstName !== undefined)
            user.firstName = dto.firstName;
        if (dto.lastName !== undefined)
            user.lastName = dto.lastName;

        if (avatarFile) {
            const uploadDir = '/app/uploads/avatars';
            if (!fs.existsSync(uploadDir))
                fs.mkdirSync(uploadDir, { recursive: true });

            const ext = path.extname(avatarFile.originalname) || '.png';
            const filename = `${userId}${ext}`;
            const filepath = path.join(uploadDir, filename);

            // Delete any existing avatar files for this user
            const existingFiles = fs.readdirSync(uploadDir).filter(f => f.startsWith(userId));
            for (const f of existingFiles) {
                try { fs.unlinkSync(path.join(uploadDir, f)); } catch {}
            }

            fs.writeFileSync(filepath, avatarFile.buffer);
            user.avatarUrl = `/uploads/avatars/${filename}`;
            this.logger.log('Avatar uploaded', { context: 'UserService', userId, filename });
        } else if (dto.avatarUrl !== undefined) {
            // User provided a URL instead of a file
            // Delete any existing uploaded avatar file
            const uploadDir = '/app/uploads/avatars';
            if (fs.existsSync(uploadDir)) {
                const existingFiles = fs.readdirSync(uploadDir).filter(f => f.startsWith(userId));
                for (const f of existingFiles) {
                    try { fs.unlinkSync(path.join(uploadDir, f)); } catch {}
                }
            }
            user.avatarUrl = dto.avatarUrl || null;
        }

        try {
            const saved = await this.userrepo.save(user);
            this.logger.log('Profile updated', { context: 'UserService', userId });
            return saved;
        } catch (error) {
            if (error.code === '23505')
                throw new ConflictException('Username already taken');
            throw new InternalServerErrorException('Failed to update profile');
        }
    }
}