import { Module } from '@nestjs/common';
import { GenTextService } from './gen-text.service';
import { GenTextController } from './gen-text.controller';
import { OpenaiModule } from 'src/openai/openai.module';
import { LoggerModule } from 'src/logger/logger.module';

@Module({
  imports: [OpenaiModule, LoggerModule],
  providers: [GenTextService],
  controllers: [GenTextController],
})
export class GenTextModule {}
