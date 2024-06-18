import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAI } from 'openai';
import { extractJsonFromString } from 'src/common/utils';
import { LoggerService } from 'src/logger/logger.service';

@Injectable()
export class OpenaiService {
  private openai: OpenAI;

  constructor(
    private readonly configService: ConfigService,
    private readonly loggerService: LoggerService,
  ) {
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

  async generateThumbnail(prompt: string, input: string) {
    const chatCompletion = await this.openai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: prompt,
        },
        {
          role: 'user',
          content: input,
        },
      ],
      model: 'gpt-4o',
      temperature: 0.2,
      response_format: { type: 'json_object' },
    });
    const originString = chatCompletion.choices[0]?.message.content as string;
    try {
      const resultString = extractJsonFromString(originString) as string;
      const result: {
        positive: string;
        negative: string;
        keyword: string[];
      } = JSON.parse(resultString);

      if (!result.negative) result.negative = '';
      if (!result.keyword) result.keyword = [];
      result.keyword = result.keyword.map((item) =>
        item.toUpperCase().replace(/\s+/g, '_').replace(/-/g, '_'),
      );

      result.positive =
        'best quality, masterpiece, 4K, raytracing,' + result.positive;
      result.negative =
        '(bad quality, worst quality:1.4, bad hands),More than 5 toes on one foot, hand with more than 5 fingers, ' +
        result.negative;

      return result;
    } catch (error) {
      return {
        positive: 'best quality, masterpiece, 4K, raytracing,',
        negative:
          '(bad quality, worst quality:1.4, bad hands),More than 5 toes on one foot, hand with more than 5 fingers',
        keyword: '',
      };
    }
  }
}
