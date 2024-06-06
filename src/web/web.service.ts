import { Injectable } from '@nestjs/common';
import { OpenaiService } from 'src/openai/openai.service';

@Injectable()
export class WebService {
  constructor(private readonly openai: OpenaiService) {}

  async generateFearText(prompt: string) {
    return await this.openai.generateFear(prompt);
  }
}
