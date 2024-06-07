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
import { PostProjectDto } from 'src/dto/post-web.dto';

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
}
