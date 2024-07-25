import { Module } from '@nestjs/common';
import { WebModule } from './web/web.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfigModule } from './config/config.module';
import { LoggerModule } from './logger/logger.module';
import { GenTextModule } from './gen-text/gen-text.module';

@Module({
  imports: [ConfigModule, WebModule, PrismaModule, LoggerModule, GenTextModule],
})
export class AppModule {}
