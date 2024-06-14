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

@Injectable()
export class WebService {
  constructor(
    private readonly openai: OpenaiService,
    private readonly prisma: PrismaService,
    private readonly lambda: LambdaService,
  ) {}

  async generateFearText(prompt: string) {
    return await this.openai.generateFear(prompt);
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
      body,
    };
  }

  async createThumnail(user: User, body: CreateThumbnailDto) {
    const input = body.story
      ? JSON.stringify({
          includePerson: body.includePerson,
          story: body.story,
        })
      : JSON.stringify({
          includePerson: body.includePerson,
          description: body.description,
        });

    const inputPrompt = body.story
      ? thumbnailPromptByStory
      : thumbnailPromptByDescription;

    const result = await this.openai.generateThumbnail(input, inputPrompt);

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
        ...(body.vaeId && { vaeId: body.vaeId }),
        ...(body.upscale && { upscale: body.upscale }),
      },
    });

    await this.prisma.image.create({
      data: {
        updatedAt: new Date(),
        url: `${body.userName}_${0}_${body.saveTime}.png`,
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
