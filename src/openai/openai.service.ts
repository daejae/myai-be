import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
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
    const list = [];
    const extractJson = (str: string): object | null => {
      const startIndex = str.indexOf('{'); // JSON 시작 지점 찾기
      if (startIndex === -1) return null; // 시작 괄호가 없으면 null 반환

      let counter = 1; // 중괄호 카운터 시작
      for (let i = startIndex + 1; i < str.length; i++) {
        if (str[i] === '{') {
          counter++;
        } else if (str[i] === '}') {
          counter--;
          if (counter === 0) {
            const plain = str.substring(startIndex, i + 1);
            const fix = plain
              .replace(/}\s*{/g, '},{')
              .replace(/(?<=["\]}])\s*(?=["\[{])/g, ',');
            // return jsonString.replace(/}\s*{/g, '},{').replace(/(?<=["\]}])\s*(?=["\[{])/g, ',');

            return JSON.parse(fix);
            // return JSON.parse(str.substring(startIndex, i + 1));
          }
        }
      }
      return null;
    };

    // 초기 메시지 생성
    const initialMessage = await this.openai.beta.threads.messages.create(
      threadId,
      {
        role: 'user',
        content: prompt || '무서운 이야기 해줘',
      },
    );

    const run = this.openai.beta.threads.runs.stream(threadId, {
      assistant_id: assistantId,
    });

    for await (const event of run) {
      if (event.event == 'thread.message.completed') {
        const result = (event.data.content[0] as any)?.text.value;
        console.log(result);

        if (result.length < 0)
          throw new HttpException(
            'GPT API error',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        const jsonData = extractJson(result) as {
          title: string;
          story: string;
          next: boolean;
        };
        if (!jsonData) {
          throw new HttpException(
            'No valid JSON found or parsing error',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
        list.push(jsonData);
      }
    }

    if (list[list.length - 1].next == true) {
      while (true) {
        await this.openai.beta.threads.messages.create(threadId, {
          role: 'user',
          content: '계속 이어서',
        });

        const run = this.openai.beta.threads.runs.stream(threadId, {
          assistant_id: assistantId,
        });

        let result = '';
        for await (const event of run) {
          if (event.event == 'thread.message.completed') {
            result = (event.data.content[0] as any)?.text.value;
            console.log(result);
          }
        }

        if (result.length < 0)
          throw new HttpException(
            'GPT API error',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );

        const jsonData = extractJson(result) as {
          title: string;
          story: string;
          next: boolean;
        };
        list.push(jsonData);

        if (jsonData.next == false) break;
      }
    }

    return {
      title: list[0].title,
      story: list.map((item) => item.story).join(' '),
    };
  }
  async generateThumbnail({
    systemPrompt,
    userPrompt,
    appendPositive,
  }: {
    systemPrompt: string;
    userPrompt: string;
    appendPositive: string;
  }) {
    const chatCompletion = await this.openai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
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
        'best quality, masterpiece, 4K, raytracing, ' +
        appendPositive +
        result.positive;
      result.negative =
        '(bad quality, worst quality:1.4, bad hands),More than 5 toes on one foot, hand with more than 5 fingers, ' +
        result.negative;

      return result;
    } catch (error) {
      return {
        positive:
          'best quality, masterpiece, 4K, raytracing, ' + appendPositive,
        negative:
          '(bad quality, worst quality:1.4, bad hands),More than 5 toes on one foot, hand with more than 5 fingers',
        keyword: '',
      };
    }
  }
}
