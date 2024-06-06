import { Module } from '@nestjs/common';
import { WebModule } from './web/web.module';
import { PrismaModule } from './prisma/prisma.module';
import { EnvModule } from './config/config.module';

@Module({
  imports: [EnvModule, WebModule, PrismaModule],
  providers: [],
})
export class AppModule {}
