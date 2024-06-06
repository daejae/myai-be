import { Test, TestingModule } from '@nestjs/testing';
import { WebService } from './web.service';
import { OpenaiModule } from 'src/openai/openai.module';
import { EnvModule } from 'src/config/config.module';

describe('WebService', () => {
  let service: WebService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [EnvModule, OpenaiModule],
      providers: [WebService],
    }).compile();

    service = module.get<WebService>(WebService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
