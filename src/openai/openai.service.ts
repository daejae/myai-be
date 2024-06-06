import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAI } from 'openai';

@Injectable()
export class OpenaiService {
  private openai: OpenAI;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('openai.apiKey');
    this.openai = new OpenAI({
      apiKey: apiKey,
    });
  }

  async generateFear(prompt: string) {
    const assistantId = this.configService.get<string>(
      'openai.fearAssistantId',
    );
    const threadId = this.configService.get<string>('openai.fearThreadId');

    const message = await this.openai.beta.threads.messages.create(threadId, {
      role: 'user',
      content: prompt || '무서운 이야기 해줘',
    });

    const run = this.openai.beta.threads.runs.stream(threadId, {
      assistant_id: assistantId,
    });

    let result = '';
    for await (const event of run) {
      if (event.event == 'thread.message.completed') {
        result = (event.data.content[0] as any)?.text.value;
        // result = extractJsonFromString(result) as string;
      }
    }

    return result;
  }
}
