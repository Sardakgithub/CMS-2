import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { User } from '../auth/user.decorator';
import { DecodedIdToken } from 'firebase-admin/auth';

@Controller('posts')
export class PostsController {
    constructor(private readonly postsService: PostsService) { }

    @Post()
    @UseGuards(FirebaseAuthGuard)
    create(@User() user: DecodedIdToken, @Body() createPostDto: CreatePostDto) {
        return this.postsService.create(user.uid, createPostDto);
    }

    @Get()
    findAll(@Query('authorId') authorId?: string) {
        return this.postsService.findAll(authorId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.postsService.findOne(id);
    }

    @Patch(':id')
    @UseGuards(FirebaseAuthGuard)
    update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
        // TODO: Check if user is author
        return this.postsService.update(id, updatePostDto);
    }

    @Delete(':id')
    @UseGuards(FirebaseAuthGuard)
    remove(@Param('id') id: string) {
        // TODO: Check if user is author
        return this.postsService.remove(id);
    }

    @Get(':id/likes')
    getLikeCount(@Param('id') id: string) {
        return this.postsService.getLikeCount(id);
    }

    @Get(':id/liked')
    @UseGuards(FirebaseAuthGuard)
    getLikedStatus(@Param('id') id: string, @User() user: DecodedIdToken) {
        return this.postsService.getLikedStatus(id, user.uid);
    }

    @Post(':id/like')
    @UseGuards(FirebaseAuthGuard)
    likePost(@Param('id') id: string, @User() user: DecodedIdToken) {
        return this.postsService.likePost(id, user.uid);
    }

    @Delete(':id/like')
    @UseGuards(FirebaseAuthGuard)
    unlikePost(@Param('id') id: string, @User() user: DecodedIdToken) {
        return this.postsService.unlikePost(id, user.uid);
    }
}
