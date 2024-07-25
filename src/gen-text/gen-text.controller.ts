import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { CustomAuthGuard } from 'src/common/guards/custom-auth.guard';
import { GetShortTextDto } from './dto/get-short-text.dto';
import { User } from '@prisma/client';
import { LoggerService } from 'src/logger/logger.service';
import { GenTextService } from './gen-text.service';
import { GetLongTextDto } from './dto/get-long-text.dto';

@Controller('api/web')
export class GenTextController {
  constructor(private service: GenTextService, private logger: LoggerService) {}

  @UseGuards(CustomAuthGuard)
  @Get('gen-text')
  async getTextLong(@Req() req: Request, @Query() query: GetLongTextDto) {
    const user = req['user'] as User;
    await this.logger.logInfo(
      `롱폼 텍스트 요청 // ${user.name} // ${JSON.stringify(query)}`,
    );

    const result = await this.service.createLongText(query);

    await this.logger.logInfo(
      `텍스트 요청 완료 // ${user.name} // ${JSON.stringify(
        query,
      )} // ${JSON.stringify(result)} `,
    );

    return result;
  }
  generateText;

  @UseGuards(CustomAuthGuard)
  @Get('gen-text-short')
  async getTextShort(@Req() req: Request, @Query() query: GetShortTextDto) {
    const user = req['user'] as User;
    await this.logger.logInfo(`텍스트 요청 쇼츠 // ${user.name}`);
    const result = await this.service.createShortText(query);
    await this.logger.logInfo(
      `텍스트 요청 완료 쇼츠 // ${user.name} // ${JSON.stringify(
        query,
      )} // ${JSON.stringify(result)} `,
    );

    return result;
  }
}
