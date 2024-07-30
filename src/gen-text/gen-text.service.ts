import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { LoggerService } from 'src/logger/logger.service';
import { OpenaiService } from 'src/openai/openai.service';
import { GetShortTextDto } from './dto/get-short-text.dto';
import { User } from '@prisma/client';
import { GetTextDto } from './dto/get-long-text.dto';
import getPrompt from './const/getPrompt';

@Injectable()
export class GenTextService {
  constructor(
    private openai: OpenaiService,
    private prisma: PrismaService,
    private logger: LoggerService,
  ) {}

  async createTextLong(user: User, { category, language }: GetTextDto) {
    const process = async (category, language) => {
      const prompt = getPrompt(category, language);

      const draft = await this.openai.createChat({
        userPrompt: prompt.categoryMessage,
        model: 'gpt-4o',
      });

      let modifyDraft = draft.message.content;

      while (modifyDraft.length < 4000) {
        const resizeResult = await this.openai.createChat({
          userPrompt: `${'이야기 늘려줘'} \n ${modifyDraft}`,
        });

        modifyDraft = resizeResult.message.content;
      }

      const title = await this.openai.createChat({
        userPrompt: `${prompt.pipelines.title} \n${modifyDraft}`,
      });

      const resultString = await this.openai.createChat({
        userPrompt: `${prompt.pipelines.json} \n${title.message.content}\n${modifyDraft}`,
        isJson: true,
      });

      return JSON.parse(resultString.message.content);
    };

    await this.logger.logInfo(`텍스트 요청 // ${user.name}`);

    for (let retry = 0; retry < 3; retry++) {
      try {
        const result = await process(category, language ?? 'ko');

        await this.prisma.generatedStory.create({
          data: {
            category: category,
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
    const process = async (category, language) => {
      const prompt = getPrompt(category, language);

      const draft = await this.openai.createChat({
        userPrompt: prompt.categoryMessage,
        model: 'gpt-4o',
      });

      const title = await this.openai.createChat({
        userPrompt: `${prompt.pipelines.title} \n${draft.message.content}`,
      });

      let modifyDraft = draft.message.content;

      while (modifyDraft.length > +prompt.pipelines.lengthGoal) {
        const resizeResult = await this.openai.createChat({
          userPrompt: `${prompt.pipelines.length} \n ${modifyDraft}`,
        });

        modifyDraft = resizeResult.message.content;
      }

      const resultString = await this.openai.createChat({
        userPrompt: `${prompt.pipelines.json} \n${title.message.content}. \n${modifyDraft}`,
        isJson: true,
      });

      return JSON.parse(resultString.message.content);
    };
    await this.logger.logInfo(`텍스트 요청 쇼츠 // ${user.name}`);

    for (let retry = 0; retry < 3; retry++) {
      try {
        const result = await process(category, language ?? 'ko');

        await this.prisma.generatedStory.create({
          data: {
            category: category,
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
