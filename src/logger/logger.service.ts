import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateLogDto } from './dto/create-log.dto';

@Injectable()
export class LoggerService {
  constructor(private readonly prisma: PrismaService) {}

  async logError(message: string) {
    const log: CreateLogDto = {
      level: 'error',
      message,
    };
    await this.prisma.log.create({ data: log });
  }

  async logInfo(message: string) {
    const log: CreateLogDto = {
      level: 'info',
      message,
    };
    await this.prisma.log.create({ data: log });
  }

  async logApiRequest(message: string) {
    const log: CreateLogDto = {
      level: 'api',
      message,
    };
    await this.prisma.log.create({ data: log });
  }
}
