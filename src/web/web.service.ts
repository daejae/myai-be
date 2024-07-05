import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PostProjectDto } from 'src/web/dtos/post-web.dto';
import { LambdaService } from 'src/lambda/lambda.service';
import { OpenaiService } from 'src/openai/openai.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateThumbnailDto } from './dtos/create-thumbnail.dto';
import {
  thumbnailPromptByDescription,
  thumbnailPromptByStory,
} from 'src/common/constants';
import { checkValues } from 'src/common/utils';
import { GetGenerateText } from './dtos/get-gen-text.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WebService {
  constructor(
    private readonly openai: OpenaiService,
    private readonly prisma: PrismaService,
    private readonly lambda: LambdaService,
    private readonly config: ConfigService,
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

  async generateText({ prompt, category, language, length }: GetGenerateText) {
    const categoryConfig = this.config.get(`openai.${category}`);

    if (!categoryConfig) {
      throw new HttpException('Invalid category', HttpStatus.BAD_REQUEST);
    }

    const scriptLength = length || 4000;
    const config = {
      ...categoryConfig,
      prompt:
        // ` (이스케이프 문자를 활용해서 출력한다. 개행(\n), 따옴표(\\'), 쌍다옴표(\\"))`,
        `!important (출력은 반드시 JSON 포맷을 지켜야한다. 개행 및 들여쓰기는 출력에 포함하지 않는다, 홀따옴표 및 쌍따옴표는 반드시 이스케이프 문자로 치환하여 출력한다), (스크립트 생성 시 새로운 이야기로 만든다), (문장과 문장 사이를 공백으로 구분한다)` +
        `, (스크립트 출력 언어: ${language || 'ko'})` +
        `, (스크립트는 반드시 ${scriptLength}글자이상)` +
        // `, (스크립트는 반드시 ${Math.ceil(
        //   scriptLength / 2000,
        // )}번 나눠서 이야기를 만들어야하고 전체적인 길이는 ${scriptLength}글자이상이다)` +
        `\\n 요청사항 : ${prompt || this.getDefaultPrompt(category)}`,
    };

    // const config = {
    //   ...categoryConfig,
    //   prompt: JSON.stringify({
    //     출력언어: `${language || 'ko'}`,
    //     필수지침: `출력은 반드시 JSON 포맷을 지켜야한다. 개행 및 들여쓰기는 출력에 포함하지 않는다, 홀따옴표 및 쌍따옴표는 반드시 이스케이프 문자로 치환하여 출력한다, 스크립트 생성 시 새로운 이야기로 만든다`,
    //     요청: prompt || this.getDefaultPrompt(category),
    //   }),
    // };

    if (!config.assistantId || !config.threadId) {
      throw new HttpException(
        'Configuration not found',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return await this.openai.generateTextWithAssistant(config);
  }

  async processPeoject(user: User, body: PostProjectDto) {
    if (!body.data.some((item) => item.imageGen == true)) {
      throw new HttpException('Invalid sentence', HttpStatus.BAD_REQUEST);
    }

    const projectResult = await this.prisma.webProject.create({
      data: {
        userId: user.id,
        modelVersionId: body.modelId,
        projectUserName: body.userName,
        saveSuffix: body.saveTime,
        ...(body.vaeId && { vaeId: body.vaeId }),
        ...(body.promptReference && { promptReference: body.promptReference }),
        ...(body.seed && { seed: body.seed }),
        ...(body.width && { width: body.width }),
        ...(body.height && { height: body.height }),
        ...(body.steps && { steps: body.steps }),
        ...(body.upscale && { upscale: body.upscale }),
        ...(body.includePerson && { includePerson: body.includePerson }),
      },
      include: {
        Sentence: true,
      },
    });

    if (projectResult.Sentence.length > body.data.length) {
      const deletedList = projectResult.Sentence.slice(body.data.length);
      await this.prisma.sentence.deleteMany({
        where: {
          id: {
            in: deletedList.map((item) => item.id),
          },
        },
      });
    }

    for (let index = 0; index < body.data.length; index++) {
      const sentenceData = body.data.at(index);

      await this.prisma.sentence.upsert({
        where: {
          webProjectId_sentenceIndex: {
            sentenceIndex: index,
            webProjectId: projectResult.id,
          },
        },
        create: {
          webProjectId: projectResult.id,
          sentenceIndex: index,
          sentence: sentenceData?.sentence as string,
          status: sentenceData?.imageGen ? 'READY' : 'DONE',
        },
        update: {
          sentence: sentenceData?.sentence as string,
          status: sentenceData?.imageGen ? 'READY' : 'DONE',
        },
      });
    }

    await this.lambda.invokeFunction(
      'serverless-typescript-express-prod-webServiceProcess',
    );

    return {
      // body,
    };
  }

  async createThumnail(user: User, body: CreateThumbnailDto) {
    // true - description // false - story
    const isDescriptionValue = checkValues(body.story, body.description);
    const userPrompt = isDescriptionValue
      ? JSON.stringify({
          includePerson: body.includePerson,
          description: body.description,
        })
      : JSON.stringify({
          includePerson: body.includePerson,
          story: body.story,
        });

    const systemPrompt = isDescriptionValue
      ? thumbnailPromptByDescription
      : thumbnailPromptByStory;

    const appendPositive =
      body.includePerson == true
        ? `hands in pockets, ${
            body.cameraPosition ? body.cameraPosition + ', ' : ''
          }`
        : '';

    const result = await this.openai.generateThumbnail({
      userPrompt,
      systemPrompt,
      appendPositive,
    });

    const generateImageResult = await this.prisma.generateImage.create({
      data: {
        sampler: body.sampler || 'DPM2 a Karras',
        steps: body.steps,
        negative: result.negative,
        positive: result.positive,
        type: 'TEXT2IMAGE',
        batchCount: 1,
        width: body.width,
        height: body.height,
        gpuPriority: body.gpuType || 'RTX3070',
        upscale: body.upscale,
        userId: user.id,
        modelVersionId: body.modelId,
        concept: isDescriptionValue ? body.description : body.story,
        ...(body.vaeId && { vaeId: body.vaeId }),
        ...(body.upscale && { upscale: body.upscale }),
      },
    });

    await this.prisma.image.create({
      data: {
        updatedAt: new Date(),
        url: `${body.userName}_${'thumb'}_${body.saveTime}.png`,
        mediaType: 'image',
        sourceType: 'GEN_BY_WEB_SERVICE',
        mimeType: 'image/png',
        width: generateImageResult.width,
        height: generateImageResult.height,
        userId: generateImageResult.userId,
        generateImageId: generateImageResult.id,
      },
    });

    await this.lambda.invokeFunction(
      'websocket-gpu-server-dev-sendTask2Idle_2',
    );
    return result;
  }
}
