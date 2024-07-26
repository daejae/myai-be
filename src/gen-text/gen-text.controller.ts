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
    await this.logger.logInfo(
      `텍스트 요청 // ${user.name} // ${JSON.stringify(query)}`,
    );

    for (let retry = 0; retry < 3; retry++) {
      try {
        const result = await this.service.createText({
          ...query,
          length: query.length ?? 4000,
        });

        await this.logger.logInfo(
          `텍스트 요청 완료 // ${user.name} // ${JSON.stringify(
            query,
          )} // ${JSON.stringify(result)} `,
        );

        return result;
      } catch (e) {
        console.log(e);
      }
    }
    throw new ServiceUnavailableException();
  }

  @UseGuards(CustomAuthGuard)
  @Get('gen-text-short')
  async getTextShort(@Req() req: Request, @Query() query: GetShortTextDto) {
    const user = req['user'] as User;
    await this.logger.logInfo(`텍스트 요청 쇼츠 // ${user.name}`);

    for (let retry = 0; retry < 3; retry++) {
      try {
        const result = await this.service.createText({
          ...query,
          length: 400,
        });

        await this.logger.logInfo(
          `텍스트 요청 완료 쇼츠 // ${user.name} // ${JSON.stringify(
            query,
          )} // ${JSON.stringify(result)} `,
        );

        return result;
      } catch (e) {
        console.log(e);
      }
    }

    throw new ServiceUnavailableException();
  }
}
