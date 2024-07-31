import {
  Controller,
  Get,
  Query,
  Req,
  ServiceUnavailableException,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { CustomAuthGuard } from 'src/common/guards/custom-auth.guard';
import { GetShortTextDto } from './dto/get-short-text.dto';
import { User } from '@prisma/client';
import { LoggerService } from 'src/logger/logger.service';
import { GenTextService } from './gen-text.service';
import { GetTextDto } from './dto/get-long-text.dto';

@Controller('api/web')
export class GenTextController {
  constructor(private service: GenTextService, private logger: LoggerService) {}

  @UseGuards(CustomAuthGuard)
  @Get('gen-text')
  async getTextLong(@Req() req: Request, @Query() query: GetTextDto) {
    const user = req['user'] as User;

    if (query.category == 'philosophy')
      return await this.service.createTextLongPhilosophy(user, query);

    return await this.service.createTextLong(user, query);
  }

  @UseGuards(CustomAuthGuard)
  @Get('gen-text-short')
  async getTextShort(@Req() req: Request, @Query() query: GetShortTextDto) {
    const user = req['user'] as User;

    if (query.category == 'philosophy')
      return await this.service.createTextShortPhilosophy(user, query);

    return await this.service.createTextShort(user, query);
  }
}
