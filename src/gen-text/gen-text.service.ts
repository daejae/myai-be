import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { LoggerService } from 'src/logger/logger.service';
import { OpenaiService } from 'src/openai/openai.service';
import { GetShortTextDto } from './dto/get-short-text.dto';
import { GeneratedStory_category, User } from '@prisma/client';
import { GetTextDto } from './dto/get-long-text.dto';

@Injectable()
export class GenTextService {
  constructor(
    private openai: OpenaiService,
    private prisma: PrismaService,
    private logger: LoggerService,
  ) {}

  async createTextLong(
    user: User,
    { category, language, prompt, length }: GetTextDto,
  ) {
    const process = async ({
      category,
      language,
      prompt,
      length,
    }: GetTextDto) => {
      const draft = await this.openai.createChat({
        userPrompt: `한국 인터넷에서 흔히 볼수 있는 공포 썰을 작성해줘.`,
        model: 'gpt-4o',
      });

      const title = await this.openai.createChat({
        userPrompt: `해당 이야기를 바탕으로 업로드 되어질 영상의 제목을 추천해줘, 유튜브 영상의 제목으로 가장 적절한 제목 1개만 알려줘. \n${draft.message.content}`,
      });

      const resultString = await this.openai.createChat({
        userPrompt: `이야기를 JSON 포맷으로 변경, JSON은 반드시 "title"과 "story"롤 가진다. "title"과 "story"는 반드시 string 타입. \n${title.message.content}\n${draft.message.content}`,
        isJson: true,
      });

      return JSON.parse(resultString.message.content);
    };

    await this.logger.logInfo(`텍스트 요청 // ${user.name}`);

    for (let retry = 0; retry < 3; retry++) {
      try {
        const result = await process({
          category,
          language,
          prompt,
          length: length ?? 4000,
        });

        await this.prisma.generatedStory.create({
          data: {
            category: category as GeneratedStory_category,
            content: result.story,
            formType: 'LONG',
            inputPrompt: '',
            title: result.title,
          },
        });

        await this.logger.logInfo(
          `텍스트 요청 완료 // ${user.name} // ${JSON.stringify(result)} `,
        );

        return result;
      } catch (e) {
        console.log(e);
      }
    }
  }

  async createTextShort(user: User, { category, language }: GetShortTextDto) {
    const process = async ({
      category,
      language,
      prompt,
      length,
    }: GetTextDto) => {
      const draft = await this.openai.createChat({
        userPrompt: prompt,
        model: 'gpt-4o',
      });

      const title = await this.openai.createChat({
        userPrompt: `해당 이야기를 바탕으로 업로드 되어질 영상의 제목을 추천해줘, 유튜브 영상의 제목으로 가장 적절한 제목 1개만 알려줘. \n${draft.message.content}`,
      });

      let modifyDraft = draft.message.content;

      while (modifyDraft.length > length) {
        const resizeResult = await this.openai.createChat({
          userPrompt: `이야기 줄여줘. \n ${modifyDraft}`,
        });

        modifyDraft = resizeResult.message.content;
      }

      const resultString = await this.openai.createChat({
        userPrompt: `이야기를 JSON 포맷으로 변경, JSON은 반드시 "title"과 "story"롤 가진다. "title"과 "story"는 반드시 string 타입. \n${title.message.content}. \n${modifyDraft}`,
        isJson: true,
      });

      return JSON.parse(resultString.message.content);
    };
    await this.logger.logInfo(`텍스트 요청 쇼츠 // ${user.name}`);

    const prompt = `한국 인터넷에서 흔히 볼수 있는 공포 썰을 작성해줘.`;

    for (let retry = 0; retry < 3; retry++) {
      try {
        const result = await process({
          category,
          language,
          prompt,
          length: 400,
        });

        await this.prisma.generatedStory.create({
          data: {
            category: category as GeneratedStory_category,
            content: result.story,
            formType: 'SHORT',
            inputPrompt: '',
            title: result.title,
          },
        });

        await this.logger.logInfo(
          `텍스트 요청 완료 쇼츠 // ${user.name} // ${JSON.stringify(
            result,
          )} // ${JSON.stringify(result)} `,
        );

        return result;
      } catch (e) {
        console.log(e);
      }
    }
  }
}
