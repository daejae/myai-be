import { Module } from '@nestjs/common';
import { WebModule } from './web/web.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfigModule } from './config/config.module';
import { LoggerModule } from './logger/logger.module';

@Module({
  imports: [ConfigModule, WebModule, PrismaModule, LoggerModule],
})
export class AppModule {}
