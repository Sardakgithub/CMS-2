import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { IncomingMessage } from 'http';
import { Request } from 'express';

@Module({
  imports: [
    PinoLoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        pinoHttp: {
          level: config.get('LOG_LEVEL') || 'info',
          transport: {
            target: 'pino-pretty',
            options: {
              singleLine: true,
              colorize: true,
              translateTime: 'yyyy-mm-dd HH:MM:ss Z',
              ignore: 'pid,hostname,reqId',
            },
          },
          serializers: {
            req: (req: IncomingMessage) => ({
              method: req.method,
              url: req.url,
              headers: {
                'user-agent': req.headers['user-agent'],
                host: req.headers.host,
              },
            }),
            res: (res: { statusCode: number }) => ({
              statusCode: res.statusCode,
            }),
          },
          redact: {
            paths: [
              'req.headers.authorization',
              'req.headers.cookie',
              'req.body.password',
              'req.body.confirmPassword',
              'req.body.token',
            ],
            remove: true,
          },
        },
      }),
    }),
  ],
  exports: [PinoLoggerModule],
})
export class LoggerModule {}

// This interface will be used to type our logger
import { Logger as PinoLogger } from 'pino';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Logger = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): PinoLogger => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return (request as any).log || console;
  },
);

export { PinoLogger as ILogger };
