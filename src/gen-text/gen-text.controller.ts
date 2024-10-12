import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
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

    return await this.service.createText(user, {
      category: query.category,
      language: query.language,
      isLong: true,
    });
  }

  @UseGuards(CustomAuthGuard)
  @Get('gen-text-merge')
  async getTextLongMerge(@Req() req: Request, @Query() query: GetTextDto) {
    const user = req['user'] as User;

    const result: { title: string; story: string }[] = [];

    while (true) {
      result.push(
        await this.service.createText(user, {
          category: query.category,
          language: query.language,
          isLong: true,
        }),
      );

      const totalLenght = result.reduce(
        (sum, current) => sum + current.story.length,
        0,
      );

      if (totalLenght > 5000 && totalLenght < 6500) break;
      else if (totalLenght > 5000) {
        result.length = 0;
      }
    }

    return result;
  }

  @UseGuards(CustomAuthGuard)
  @Get('gen-text-short')
  async getTextShort(@Req() req: Request, @Query() query: GetShortTextDto) {
    const user = req['user'] as User;

    return await this.service.createText(user, {
      category: query.category,
      language: query.language,
      isLong: false,
    });
  }
}
