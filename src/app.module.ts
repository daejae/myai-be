import { Module } from '@nestjs/common';
import { WebModule } from './web/web.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from './config/config.module';

@Module({
  imports: [ConfigModule, WebModule, PrismaModule],
  providers: [],
})
export class AppModule {}
