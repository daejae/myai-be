import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { WebService } from './web.service';
import { CustomAuthGuard } from 'src/common/guards/custom-auth.guard';
import { User } from '@prisma/client';
import { PostProjectDto } from 'src/web/dtos/post-web.dto';
import { CreateThumbnailDto } from './dtos/create-thumbnail.dto';
import { LoggerService } from 'src/logger/logger.service';
import { GetGenerateText } from './dtos/get-gen-text.dto';
import { GetGenerateShortText } from './dtos/get-gen-text-short.dto';
import { debugError } from 'src/common/utils/debugError';

@UseGuards(CustomAuthGuard)
@Controller('api/web')
export class WebController {
  constructor(
    private readonly webService: WebService,
    private readonly loggerService: LoggerService,
  ) {}

  @Get('gen-text')
  async generateText(
    @Req() req: Request,
    @Query() query: GetGenerateText,
  ): Promise<object> {
    const user = req['user'] as User;
    await this.loggerService.logInfo(`텍스트 요청 // ${user.name}`);
    const result = await this.webService.generateText(query);

    await this.loggerService.logInfo(
      `텍스트 요청 완료 // ${user.name} // ${JSON.stringify(
        query,
      )} // ${JSON.stringify(result)} `,
    );

    return result;
  }

  @Get('gen-text-short')
  async generateTextShort(
    @Req() req: Request,
    @Query() query: GetGenerateShortText,
  ): Promise<object> {
    const user = req['user'] as User;
    await this.loggerService.logInfo(`텍스트 요청 쇼츠 // ${user.name}`);
    const result = await this.webService.generateText_Short(query);
    await this.loggerService.logInfo(
      `텍스트 요청 완료 쇼츠 // ${user.name} // ${JSON.stringify(
        query,
      )} // ${JSON.stringify(result)} `,
    );

    return result;
  }

  @Post('projects')
  async PostProjects(
    @Req() req: Request,
    @Body() postProjectsDto: PostProjectDto,
  ) {
    const user = req['user'] as User;

    await this.loggerService.logInfo(`이미지 생성 요청 // ${user.name}`);
    await this.webService.processPeoject(user, postProjectsDto);
    await this.loggerService.logInfo(
      `이미지 생성 요청 처리 완료 // ${user.name}`,
    );

    return;
  }

  @Post('thumbnail')
  async PostThumbnail(
    @Body() postThumbnailDto: CreateThumbnailDto,
    @Req() req: Request,
  ) {
    const user = req['user'] as User;
    await this.loggerService.logInfo(
      `썸네일 생성 요청 // ${user.name} // ${JSON.stringify(postThumbnailDto)}`,
    );

    return await this.webService.createThumnail(user, postThumbnailDto);
  }
}
