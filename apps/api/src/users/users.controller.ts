import { Controller, Get, Post, Body, Patch, Param, UseGuards, ConflictException, NotFoundException, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { User } from '../auth/user.decorator';
import { DecodedIdToken } from 'firebase-admin/auth';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post()
    @UseGuards(FirebaseAuthGuard)
    async create(@User() user: DecodedIdToken, @Body() createUserDto: CreateUserDto) {
        const existing = await this.usersService.findById(user.uid);
        if (existing) {
            return existing;
        }
        try {
            return await this.usersService.create({
                id: user.uid,
                username: createUserDto.username,
            });
        } catch (error) {
            if (error.code === 'P2002') {
                throw new ConflictException('Username already taken');
            }
            throw error;
        }
    }

    @Get('me')
    @UseGuards(FirebaseAuthGuard)
    async getMe(@User() user: DecodedIdToken) {
        return this.usersService.findById(user.uid);
    }

    @Get(':username')
    async findOne(@Param('username') username: string) {
        const user = await this.usersService.findOne(username);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }

    @Patch('profile')
    @UseGuards(FirebaseAuthGuard)
    updateProfile(@User() user: DecodedIdToken, @Body() updateProfileDto: UpdateProfileDto) {
        return this.usersService.updateProfile(user.uid, updateProfileDto);
    }

    @Get(':username/stats')
    async getUserStats(@Param('username') username: string) {
        const user = await this.usersService.findOne(username);
        if (!user) {
            return { postsCount: 0, totalLikes: 0 };
        }
        return this.usersService.getUserStats(user.id);
    }

    @Get('me/liked-posts')
    @UseGuards(FirebaseAuthGuard)
    async getLikedPosts(@User() user: DecodedIdToken) {
        return this.usersService.getUserLikedPosts(user.uid);
    }

    @Post(':id/follow')
    @UseGuards(FirebaseAuthGuard)
    async followUser(@User() user: DecodedIdToken, @Param('id') id: string) {
        await this.usersService.followUser(user.uid, id);
        return { success: true };
    }

    @Delete(':id/follow')
    @UseGuards(FirebaseAuthGuard)
    async unfollowUser(@User() user: DecodedIdToken, @Param('id') id: string) {
        await this.usersService.unfollowUser(user.uid, id);
        return { success: true };
    }

    @Get(':id/is-following')
    @UseGuards(FirebaseAuthGuard)
    async isFollowing(@User() user: DecodedIdToken, @Param('id') id: string) {
        const isFollowing = await this.usersService.isFollowing(user.uid, id);
        return { isFollowing };
    }
}
