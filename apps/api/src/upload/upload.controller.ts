import { Controller, Post, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { User } from '../auth/user.decorator';
import { UploadService } from './upload.service';

@Controller('upload')
@UseGuards(FirebaseAuthGuard)
export class UploadController {
    constructor(private readonly uploadService: UploadService) { }

    @Post('image')
    @UseInterceptors(FileInterceptor('image', {
        limits: {
            fileSize: 5 * 1024 * 1024, // 5MB
        },
        fileFilter: (req, file, cb) => {
            if (!file.mimetype.match(/^image\/(jpeg|jpg|png|gif|webp)$/)) {
                return cb(new BadRequestException('Only image files are allowed'), false);
            }
            cb(null, true);
        },
    }))
    async uploadImage(
        @UploadedFile() file: Express.Multer.File,
        @User() user: any,
    ) {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }

        const url = await this.uploadService.uploadImage(file, user.uid);

        const response = {
            success: 1,
            file: {
                url: url,
            },
        };

        console.log('Upload response:', JSON.stringify(response));
        return response;
    }
}
