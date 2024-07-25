import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { LoggerService } from 'src/logger/logger.service';
import { OpenaiService } from 'src/openai/openai.service';
import { GetShortTextDto } from './dto/get-short-text.dto';
import {
  systemPrompt_long_horror,
  systemPrompt_short_horror,
} from 'src/common/constants';
import { GeneratedStory_category } from '@prisma/client';

@Injectable()
export class GenTextService {
  constructor(
    private openai: OpenaiService,
    private prisma: PrismaService,
    private logger: LoggerService,
  ) {}

  private getDefaultPrompt(category: string): string {
    const prompts = {
      test: '',
      fear: '무서운 이야기 만들어줘',
      horror: '무서운 이야기 만들어줘',
      greek_mythology: '그리스 신화를 기반으로 한 이야기를 만들어줘',
      // western_classics: '서양 고전 문학을 기반으로 한 이야기를 만들어줘',
      socrates: '이야기 만들어줘',
      nietzsche: '이야기 만들어줘',
      fairytale: '이야기 만들어줘',
    };

    return prompts[category] || '이야기 만들어줘';
  }

  async createLongText({ category, language, prompt }: GetShortTextDto) {
    for (let retry = 0; retry < 3; retry++) {
      const draftString = await this.openai.createChat({
        systemPrompt: systemPrompt_long_horror[0],
        userPrompt:
          // `${new Date()}` +
          `(스크립트의 장르: ${category}),` +
          `(story 길이: ${6000} 자 이상),` +
          `(스크립트 출력 언어: ${language || 'ko'}),` +
          `\\n 요청사항 : 최대한 길게 story 작성 (${6000}자 이상) ${
            prompt || this.getDefaultPrompt(category)
          }`,
      });

      const draft = JSON.parse(draftString.message.content);
      const finedStory = await this.prisma.generatedStory.findFirst({
        where: {
          title: draft.title,
          formType: 'LONG',
        },
      });

      if (finedStory) {
        this.logger.logInfo(
          `롱폼 / ${category} / ${draft.title} 중복 / retry : ${retry}`,
        );
        continue;
      }
      const resultString = await this.openai.createChat({
        systemPrompt: systemPrompt_long_horror[1],
        userPrompt:
          `story를 공백없이 ${6000}자 이상으로 내용을 확장한다, 최대한 story를 길게 확장한다, ` +
          JSON.stringify(draft),
      });
      const result = JSON.parse(resultString.message.content);

      await this.prisma.generatedStory.create({
        data: {
          category: category as GeneratedStory_category,
          content: result.story,
          formType: 'LONG',
          inputPrompt: '',
          title: result.title,
        },
      });

      return result;
    }
  }

  async createShortText({ category, language, prompt }: GetShortTextDto) {
    for (let retry = 0; retry < 3; retry++) {
      const draftString = await this.openai.createChat({
        systemPrompt: systemPrompt_short_horror[0],
        userPrompt:
          // `${new Date()}` +
          `(스크립트의 장르: ${category}),` +
          // `(story 길이: ${400} 자),` +
          `(스크립트 출력 언어: ${language || 'ko'}),` +
          `\\n 요청사항 : ${prompt || this.getDefaultPrompt(category)}`,
      });

      const draft = JSON.parse(draftString.message.content);
      const finedStory = await this.prisma.generatedStory.findFirst({
        where: {
          title: draft.title,
          formType: 'SHORT',
        },
      });

      if (finedStory) {
        this.logger.logInfo(
          `숏폼 / ${category} / ${draft.title} 중복 / retry : ${retry}`,
        );
        continue;
      }
      const resultString = await this.openai.createChat({
        systemPrompt: systemPrompt_short_horror[1],
        userPrompt:
          `story의 길이를 ${400} 자로 요약해줘, ` + JSON.stringify(draft),
      });
      const result = JSON.parse(resultString.message.content);

      await this.prisma.generatedStory.create({
        data: {
          category: category as GeneratedStory_category,
          content: result.story,
          formType: 'SHORT',
          inputPrompt: '',
          title: result.title,
        },
      });

      return result;
    }
  }
}
