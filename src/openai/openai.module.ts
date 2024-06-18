import { Module } from '@nestjs/common';
import { OpenaiService } from './openai.service';
import { LoggerModule } from 'src/logger/logger.module';

@Module({
  imports: [LoggerModule],
  providers: [OpenaiService],
  exports: [OpenaiService],
})
export class OpenaiModule {}
