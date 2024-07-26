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
import { GetTextDto } from './dto/get-long-text.dto';

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
      const draftString = await this.openai.createChatTest({
        // userPrompt: `한국 인터넷에서 흔히 볼수 있는 공포 썰을 작성해줘. title과 story로 JSON 객체로 반환해줘.`,
        userPrompt: `한국 인터넷에서 흔히 볼수 있는 공포 썰을 작성해줘. 반드시 4000글 이상`,
        isJson: false,
      });

      const draft = draftString.message.content;
      const resultString = await this.openai.createChat({
        systemPrompt: systemPrompt_long_horror[1],
        userPrompt:
          `story를 반드시 ${4000}자 이상으로 내용을 확장한다, 최대한 story를 길게 확장한다, ` +
          draft,
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
      const draftString = await this.openai.createChatTest({
        userPrompt: `한국 인터넷에서 흔히 볼수 있는 공포 썰을 작성해줘. title과 story로 JSON 객체로 반환해줘.`,
        isJson: false,
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

      return {
        // draft,
        ...result,
      };
    }
  }

  async createTextLong({ category, language, prompt, length }: GetTextDto) {
    const draft = await this.openai.createChatTest({
      userPrompt: `한국 인터넷에서 흔히 볼수 있는 공포 썰을 작성해줘.`,
      isJson: false,
    });

    const title = await this.openai.createChatTest({
      userPrompt: `해당 이야기를 바탕으로 업로드 되어질 영상의 제목을 추천해줘, 유튜브 영상의 제목으로 가장 적절한 제목 1개만 알려줘. \n${draft.message.content}`,
      isJson: false,
    });

    const resultString = await this.openai.createChatTest({
      userPrompt: `이야기를 JSON 포맷으로 변경, JSON은 반드시 "title"과 "story"롤 가진다. "title"과 "story"는 반드시 string 타입. \n${title.message.content}\n${draft.message.content}`,
      isJson: true,
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

    return {
      ...result,
    };
  }

  async createTextShort({ category, language, prompt, length }: GetTextDto) {
    const draft = await this.openai.createChatTest({
      userPrompt: `한국 인터넷에서 흔히 볼수 있는 공포 썰을 작성해줘.`,
      isJson: false,
    });

    const title = await this.openai.createChatTest({
      userPrompt: `해당 이야기를 바탕으로 업로드 되어질 영상의 제목을 추천해줘, 유튜브 영상의 제목으로 가장 적절한 제목 1개만 알려줘. \n${draft.message.content}`,
      isJson: false,
    });

    let modifyDraft = draft.message.content;

    while (modifyDraft.length > length) {
      const resizeResult = await this.openai.createChatTest({
        userPrompt: `이야기 줄여줘. \n ${modifyDraft}`,
        isJson: false,
      });
      modifyDraft = resizeResult.message.content;
    }

    const resultString = await this.openai.createChatTest({
      userPrompt: `이야기를 JSON 포맷으로 변경, JSON은 반드시 "title"과 "story"롤 가진다. "title"과 "story"는 반드시 string 타입. \n${title.message.content}. \n${modifyDraft}`,
      isJson: true,
    });

    const result = JSON.parse(resultString.message.content);

    await this.prisma.generatedStory.create({
      data: {
        category: category as GeneratedStory_category,
        content: result.story,
        formType: length < 1000 ? 'SHORT' : 'LONG',
        inputPrompt: '',
        title: result.title,
      },
    });

    return {
      // draft,
      // title,
      // modifyDraft,
      // resultString,
      // result,

      ...result,
    };
  }
}
