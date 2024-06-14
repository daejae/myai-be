import { Module } from '@nestjs/common';
import { WebController } from './web.controller';
import { WebService } from './web.service';
import { OpenaiModule } from 'src/openai/openai.module';
import { LambdaModule } from 'src/lambda/lambda.module';
import { LoggerModule } from 'src/logger/logger.module';

@Module({
  imports: [OpenaiModule, LambdaModule, LoggerModule],
  controllers: [WebController],
  providers: [WebService],
})
export class WebModule {}
