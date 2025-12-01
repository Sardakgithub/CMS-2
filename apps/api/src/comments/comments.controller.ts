import { Controller, Post, Get, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { User } from '../auth/user.decorator';

class CreateCommentDto {
    content: string;
}

class UpdateCommentDto {
    content: string;
}

@Controller()
export class CommentsController {
    constructor(private readonly commentsService: CommentsService) { }

    @Post('posts/:postId/comments')
    @UseGuards(FirebaseAuthGuard)
    async createComment(
        @Param('postId') postId: string,
        @Body() dto: CreateCommentDto,
        @User() user: any
    ) {
        const comment = await this.commentsService.createComment(postId, user.uid, dto.content);
        return comment;
    }

    @Get('posts/:postId/comments')
    async getComments(@Param('postId') postId: string) {
        const comments = await this.commentsService.getCommentsByPost(postId);
        return comments;
    }

    @Get('posts/:postId/comments/count')
    async getCommentCount(@Param('postId') postId: string) {
        const count = await this.commentsService.getCommentCount(postId);
        return { count };
    }

    @Patch('comments/:commentId')
    @UseGuards(FirebaseAuthGuard)
    async updateComment(
        @Param('commentId') commentId: string,
        @Body() dto: UpdateCommentDto,
        @User() user: any
    ) {
        const comment = await this.commentsService.updateComment(commentId, user.uid, dto.content);
        return comment;
    }

    @Delete('comments/:commentId')
    @UseGuards(FirebaseAuthGuard)
    async deleteComment(
        @Param('commentId') commentId: string,
        @User() user: any
    ) {
        await this.commentsService.deleteComment(commentId, user.uid);
        return { success: true };
    }
}
