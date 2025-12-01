// src/logger/logger.module.ts
import { Module } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';

@Module({
  imports: [PinoLoggerModule.forRoot()],
  exports: [PinoLoggerModule],
})
export class LoggerModule {}