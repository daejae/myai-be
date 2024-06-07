import { Test, TestingModule } from '@nestjs/testing';
import { WebController } from './web.controller';
import { WebService } from './web.service';
import { OpenaiModule } from 'src/openai/openai.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ConfigModule } from 'src/config/config.module';
import { LambdaModule } from 'src/lambda/lambda.module';

describe('WebController', () => {
  let controller: WebController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule, OpenaiModule, PrismaModule, LambdaModule],
      controllers: [WebController],
      providers: [WebService],
    }).compile();

    controller = module.get<WebController>(WebController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
