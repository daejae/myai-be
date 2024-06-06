import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { WebService } from './web.service';
import { CustomAuthGuard } from 'src/auth/custom-auth.guard';

@UseGuards(CustomAuthGuard)
@Controller('api/web')
export class WebController {
  constructor(private readonly webService: WebService) {}

  @Get('gen-text')
  async generateText(@Query('prompt') prompt: string): Promise<string> {
    return await this.webService.generateFearText(prompt);
  }
}
