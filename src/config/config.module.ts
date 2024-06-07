import { Module } from '@nestjs/common';
import { ConfigModule as Config } from '@nestjs/config';
import configuration from './configuration';

@Module({
  imports: [
    Config.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
  ],
})
export class ConfigModule {}
