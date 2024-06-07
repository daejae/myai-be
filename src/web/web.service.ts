import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PostProjectDto } from 'src/dto/post-web.dto';
import { LambdaService } from 'src/lambda/lambda.service';
import { OpenaiService } from 'src/openai/openai.service';
import { PrismaService } from 'src/prisma/prisma.service';

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

    const resr = await this.lambda.invokeFunction(
      'serverless-typescript-express-prod-webServiceProcess',
    );
    console.log(resr);
    // await invokeLambda('serverless-typescript-express-prod-webServiceProcess');

    return {
      body,
    };
  }
}
