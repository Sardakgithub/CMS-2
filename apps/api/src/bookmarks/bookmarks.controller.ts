import { Controller, Post, Delete, Get, Param, UseGuards } from '@nestjs/common';
import { BookmarksService } from './bookmarks.service';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { User } from '../auth/user.decorator';

@Controller()
@UseGuards(FirebaseAuthGuard)
export class BookmarksController {
    constructor(private readonly bookmarksService: BookmarksService) { }

    @Post('posts/:postId/bookmark')
    async bookmarkPost(@Param('postId') postId: string, @User() user: any) {
        await this.bookmarksService.bookmarkPost(user.uid, postId);
        return { success: true };
    }

    @Delete('posts/:postId/bookmark')
    async unbookmarkPost(@Param('postId') postId: string, @User() user: any) {
        await this.bookmarksService.unbookmarkPost(user.uid, postId);
        return { success: true };
    }

    @Get('posts/:postId/bookmarked')
    async hasBookmarked(@Param('postId') postId: string, @User() user: any) {
        const bookmarked = await this.bookmarksService.hasUserBookmarkedPost(user.uid, postId);
        return { bookmarked };
    }

    @Get('bookmarks')
    async getUserBookmarks(@User() user: any) {
        const bookmarks = await this.bookmarksService.getUserBookmarks(user.uid);
        return bookmarks.map(bookmark => bookmark.post);
    }
}
