import { Module } from '@nestjs/common';
import { WebController } from './web.controller';
import { WebService } from './web.service';
import { OpenaiModule } from 'src/openai/openai.module';
import { LambdaModule } from 'src/lambda/lambda.module';

@Module({
  imports: [OpenaiModule, LambdaModule],
  controllers: [WebController],
  providers: [WebService],
})
export class WebModule {}
