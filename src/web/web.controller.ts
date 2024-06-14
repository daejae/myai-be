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
import { CustomAuthGuard } from 'src/auth/custom-auth.guard';
import { User } from '@prisma/client';
import { PostProjectDto } from 'src/web/dtos/post-web.dto';
import { CreateThumbnailDto } from './dtos/create-thumbnail.dto';

@UseGuards(CustomAuthGuard)
@Controller('api/web')
export class WebController {
  constructor(private readonly webService: WebService) {}

  @Get('gen-text')
  async generateText(@Query('prompt') prompt: string): Promise<string> {
    return await this.webService.generateFearText(prompt);
  }

  @Post('projects')
  async PostProjects(
    @Body() postProjectsDto: PostProjectDto,
    @Req() req: Request,
  ) {
    const user = req['user'] as User;

    return await this.webService.processPeoject(user, postProjectsDto);
  }

  @Post('thumbnail')
  async PostThumbnail(
    @Body() postThumbnailDto: CreateThumbnailDto,
    @Req() req: Request,
  ) {
    const user = req['user'] as User;
    return await this.webService.createThumnail(user, postThumbnailDto);
  }
}