import { Test, TestingModule } from '@nestjs/testing';
import { WebService } from './web.service';
import { OpenaiModule } from 'src/openai/openai.module';
import { ConfigModule } from 'src/config/config.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { LambdaModule } from 'src/lambda/lambda.module';

describe('WebService', () => {
  let service: WebService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule, OpenaiModule, PrismaModule, LambdaModule],
      providers: [WebService],
    }).compile();

    service = module.get<WebService>(WebService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
