import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { LoggerService } from 'src/logger/logger.service';
import { OpenaiService } from 'src/openai/openai.service';
import { User } from '@prisma/client';
import { getLongPhilosophy, getShortPhilosophy } from './prompt/philosophy';
import { getLongHorror, getShortHorror } from './prompt/horror';
import { getLongHistory, getShortHistory } from './prompt/history';
import { getLongScience, getShortScience } from './prompt/science';
import { getLongArt, getShortArt } from './prompt/art';
import { getLongPsychology, getShortPsychology } from './prompt/psychology';
import { getLongTrivia, getShortTrivia } from './prompt/trivia';
import { getShortHoroscope } from './prompt/horoscope';
import { getShortPet } from './prompt/pet';
import { getLongFolktale, getShortFolktale } from './prompt/folktale';

@Injectable()
export class GenTextService {
  constructor(
    private openai: OpenaiService,
    private prisma: PrismaService,
    private logger: LoggerService,
  ) {}

  getProcess(category: string, isLong: boolean) {
    switch (category) {
      case 'horror':
        return isLong ? getLongHorror : getShortHorror;
      case 'philosophy':
        return isLong ? getLongPhilosophy : getShortPhilosophy;
      case 'history':
        return isLong ? getLongHistory : getShortHistory;
      case 'science':
        return isLong ? getLongScience : getShortScience;
      case 'art':
        return isLong ? getLongArt : getShortArt;
      case 'psychology':
        return isLong ? getLongPsychology : getShortPsychology;
      case 'trivia':
        return isLong ? getLongTrivia : getShortTrivia;
      case 'folktale':
        return isLong ? getLongFolktale : getShortFolktale;

      // 숏폼 전용
      case 'horoscope':
        return getShortHoroscope;
      case 'pet':
        return getShortPet;
    }
  }

  async createText(
    user: User,
    {
      category,
      language,
      isLong,
    }: {
      category: string;
      language: string;
      isLong: boolean;
    },
  ) {
    const process = this.getProcess(category, isLong);
    await this.logger.logInfo(`텍스트 요청 쇼츠 // ${user.name}`);

    for (let retry = 0; retry < 3; retry++) {
      try {
        const result = await process(this.openai, category, language ?? 'ko');

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
