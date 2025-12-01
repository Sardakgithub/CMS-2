import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

@Injectable()
export class UploadService {
    private s3Client: S3Client;
    private bucketName: string;
    private publicBaseUrl: string;
    private isConfigured: boolean;

    constructor(private configService: ConfigService) {
        const accountId = this.configService.get<string>('R2_ACCOUNT_ID');
        const accessKeyId = this.configService.get<string>('R2_ACCESS_KEY_ID');
        const secretAccessKey = this.configService.get<string>('R2_SECRET_ACCESS_KEY');

        this.bucketName = this.configService.get<string>('R2_BUCKET_NAME') || 'chronos-uploads';
        this.publicBaseUrl = this.configService.get<string>('R2_PUBLIC_BASE_URL') || '';

        console.log('R2 Config:', {
            accountId: accountId ? 'SET' : 'NOT SET',
            accessKeyId: accessKeyId ? 'SET' : 'NOT SET',
            secretAccessKey: secretAccessKey ? 'SET' : 'NOT SET',
            bucketName: this.bucketName,
            publicBaseUrl: this.publicBaseUrl,
        });

        if (accountId && accessKeyId && secretAccessKey) {
            this.s3Client = new S3Client({
                region: 'auto',
                endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
                credentials: {
                    accessKeyId,
                    secretAccessKey,
                },
                forcePathStyle: false,
            });
            console.log('✓ R2 S3Client initialized successfully');
            this.isConfigured = true;
        } else {
            console.warn('⚠️  R2 storage is not configured - uploads will fail until R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY are provided.');
            this.isConfigured = false;
        }
    }

    async uploadImage(file: Express.Multer.File, userId: string): Promise<string> {
        if (!this.isConfigured || !this.s3Client) {
            throw new Error('R2 storage is not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY environment variables.');
        }

        const fileExtension = file.originalname.split('.').pop();
        const fileName = `${userId}/${randomUUID()}.${fileExtension}`;

        console.log('Uploading to R2:', { fileName, bucket: this.bucketName });

        try {
            const command = new PutObjectCommand({
                Bucket: this.bucketName,
                Key: fileName,
                Body: file.buffer,
                ContentType: file.mimetype,
            });

            await this.s3Client.send(command);

            const url = `${this.publicBaseUrl}/${fileName}`;
            console.log('Upload successful, URL:', url);
            return url;
        } catch (error) {
            console.error('R2 upload error:', error);
            throw new Error(`Failed to upload to R2: ${error.message}`);
        }
    }
}
