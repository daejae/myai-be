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

  async generateTextWithAssistant({
    prompt,
    assistantId,
    threadId,
    retries = 3,
  }: {
    prompt: string;
    assistantId: string;
    threadId: string;
    retries: number;
  }) {
    try {
      const list: Array<{ title: string; story: string; next: boolean }> = [];
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
              // const plain = str.substring(startIndex, i + 1);
              // const fix = plain
              //   .replace(/}\s*{/g, '},{')
              //   .replace(/(?<=["\]}])\s*(?=["\[{])/g, ',')
              //   .replace(/(\r\n|\n|\r)/g, '') // 모든 개햄문자 삭제
              //   .replace(/\\'/g, "'"); // 홀따옴표 처리
              // // return jsonString.replace(/}\s*{/g, '},{').replace(/(?<=["\]}])\s*(?=["\[{])/g, ',');
              // return JSON.parse(fix);

              const plain = str.substring(startIndex, i + 1);
              const fixedPlain = plain
                .replace(/}\s*{/g, '},{') // 중첩된 JSON 객체를 배열 형식으로 변환
                .replace(/(?<=["\]}])\s*(?=["\[{])/g, ',') // 객체 사이에 쉼표 추가
                .replace(/(\r\n|\n|\r|\\n)/g, ' ') // 모든 개행 문자 삭제
                .replace(/\\'/g, "'") // 이스케이프된 작은따옴표 처리
                .replace(/\\\\"/g, `\\"`)
                .replace(/\\","next/, `.","next"`); // next앞에 쌍따옴표 처리에 이스케이프 있으면 삭제

              try {
                return JSON.parse(fixedPlain);
              } catch (e) {
                console.error('JSON 파싱 오류:', e);
                console.log('파싱 시도한 문자열:', fixedPlain);
                throw e;
              }
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
          content: prompt,
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
    } catch (error) {
      if (retries > 0) {
        console.log(`Retrying... (${3 - retries + 1})`);
        return await this.generateTextWithAssistant({
          assistantId,
          threadId,
          prompt,
          retries: retries - 1,
        });
      } else {
        throw new Error(
          `Failed to fetch data after 3 retries: ${error.message}`,
        );
      }
    }
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
