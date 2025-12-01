import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from './auth/auth.module'
import { HealthController } from './health.controller'
import { PostsModule } from './posts/posts.module'
import { UsersModule } from './users/users.module'
import { UploadModule } from './upload/upload.module'
import { BookmarksModule } from './bookmarks/bookmarks.module'
import { CommentsModule } from './comments/comments.module'
import { LikesModule } from './likes/likes.module'
import { AppGateway } from './app.gateway'
import { RoomsModule } from './rooms/rooms.module';
import { LoggerModule } from './logger/LoggerModule';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), AuthModule, PostsModule, UsersModule, UploadModule, BookmarksModule, CommentsModule, LikesModule, RoomsModule, LoggerModule],
  controllers: [HealthController],
  providers: [AppGateway],
})
export class AppModule { }
