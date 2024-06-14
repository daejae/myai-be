import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from './logger.service';
import { PrismaModule } from 'src/prisma/prisma.module';

describe('LoggerService', () => {
  let service: LoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
      providers: [LoggerService],
    }).compile();

    service = module.get<LoggerService>(LoggerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
