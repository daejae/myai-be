import {
  BadGatewayException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
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

  async createTextLongPhilosophy(
    user: User,
    { category, language }: GetTextDto,
  ) {
    const process = async (category, language) => {
      const prompt = getPrompt(category, language);

      const theory = await this.openai.createChat({
        userPrompt: `1.  세계 모든 철학자의 이름(최소20명)에서 무작위(중요)로 1명의 철학자를 선정한다.
2. 선정된 철학자의 모든 이론에서 무작위(중요)로 1개의 이론을 선정한다.
3. 선정된 철학자와 이론에 대해서 매우 간단하게 출력한다.`,
      });

      const draft = await this.openai.createChat({
        userPrompt: `해당 이론을 바탕으로 사람들에게 메세지를 전달하는 썰(이야기)를 매우 매우 길게 작성해줘. \n${theory.message.content}`,
        model: 'gpt-4o',
      });

      const modifyDraft = draft.message.content;
      // while (modifyDraft.length < 4000) {
      //   const resizeResult = await this.openai.createChat({
      //     userPrompt: `${'원본을 유지하면서 이야기 늘려줘.'} \n ${modifyDraft}`,
      //   });
      //   modifyDraft = resizeResult.message.content;
      // }

      if (modifyDraft.length < 1000) {
        throw new Error(
          '롱폼 생성된 텍스트가 너무 짧음 : ' + modifyDraft.length,
        );
      }

      const title = await this.openai.createChat({
        userPrompt: `${prompt.pipelines.title} \n${draft.message.content}`,
      });

      const resultString = await this.openai.createChat({
        userPrompt: `${prompt.pipelines.json} \n${title.message.content}\n${draft.message.content}`,
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
    throw new InternalServerErrorException();
  }

  async createTextShortPhilosophy(
    user: User,
    { category, language }: GetShortTextDto,
  ) {
    const process = async (category, language) => {
      const prompt = getPrompt(category, language);

      const theory = await this.openai.createChat({
        userPrompt: `1.  세계 모든 철학자의 이름(최소20명)에서 무작위(중요)로 1명의 철학자를 선정한다.
2. 선정된 철학자의 모든 이론에서 무작위(중요)로 1개의 이론을 선정한다.
3. 선정된 철학자와 이론에 대해서 매우 간단하게 출력한다.`,
      });

      const draft = await this.openai.createChat({
        userPrompt: `해당 이론을 바탕으로 사람들에게 메세지를 전달하는 썰(이야기)를 작성해줘. \n${theory.message.content}`,
        model: 'gpt-4o',
      });

      let modifyDraft = draft.message.content;

      while (modifyDraft.length > +prompt.pipelines.lengthGoal) {
        const resizeResult = await this.openai.createChat({
          userPrompt: `${prompt.pipelines.length} \n ${modifyDraft}`,
        });

        modifyDraft = resizeResult.message.content;
      }

      const title = await this.openai.createChat({
        userPrompt: `${prompt.pipelines.title} \n${draft.message.content}`,
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
    throw new InternalServerErrorException();
  }

  async createTextLong(user: User, { category, language }: GetTextDto) {
    const process = async (category, language) => {
      const prompt = getPrompt(category, language);

      const draft = await this.openai.createChat({
        userPrompt: prompt.categoryMessage,
        model: 'gpt-4o',
      });

      const modifyDraft = draft.message.content;
      if (modifyDraft.length < 1000) {
        throw new Error(
          '롱폼 생성된 텍스트가 너무 짧음 : ' + modifyDraft.length,
        );
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
    throw new InternalServerErrorException();
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
    throw new InternalServerErrorException();
  }
}
