import { Module } from '@nestjs/common';
import { WebModule } from './web/web.module';
import { PrismaModule } from './prisma/prisma.module';
import { EnvModule } from './env/env.module';

@Module({
  imports: [EnvModule, WebModule, PrismaModule],
  providers: [],
})
export class AppModule {}
