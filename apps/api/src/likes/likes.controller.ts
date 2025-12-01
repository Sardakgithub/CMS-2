import { Controller, Post, Delete, Get, Param, UseGuards } from '@nestjs/common';
import { LikesService } from './likes.service';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { User } from '../auth/user.decorator';

@Controller('posts/:postId')
export class LikesController {
    constructor(private readonly likesService: LikesService) { }

    @Post('like')
    @UseGuards(FirebaseAuthGuard)
    async likePost(@Param('postId') postId: string, @User() user: any) {
        await this.likesService.likePost(user.uid, postId);
        return { success: true };
    }

    @Delete('like')
    @UseGuards(FirebaseAuthGuard)
    async unlikePost(@Param('postId') postId: string, @User() user: any) {
        await this.likesService.unlikePost(user.uid, postId);
        return { success: true };
    }

    @Get('liked')
    @UseGuards(FirebaseAuthGuard)
    async hasLiked(@Param('postId') postId: string, @User() user: any) {
        const liked = await this.likesService.hasUserLikedPost(user.uid, postId);
        return { liked };
    }

    @Get('likes')
    async getPostLikes(@Param('postId') postId: string) {
        const likes = await this.likesService.getPostLikes(postId);
        const count = likes.length;
        return { count, likes };
    }
}
