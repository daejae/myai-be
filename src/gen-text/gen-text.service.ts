import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { LoggerService } from 'src/logger/logger.service';
import { OpenaiService } from 'src/openai/openai.service';
import { User } from '@prisma/client';
import { getLongPhilosophy, getShortPhilosophy } from './prompt/philosophy';
import { getLongHorror, getShortHorror } from './prompt/horror';
import { getLongHistory, getShortHistory } from './prompt/history';
import { getLongArt, getShortArt } from './prompt/art';
import { getLongPsychology, getShortPsychology } from './prompt/psychology';
import { getLongTrivia, getShortTrivia } from './prompt/trivia';
import { getShortHoroscope } from './prompt/horoscope';
import { getShortDogFood } from './prompt/dogFood';
import { getLongFolktale, getShortFolktale } from './prompt/folktale';
import { getLongScience, getShortScience } from './prompt/science';
import { getLongPsychology_script } from './prompt/psychology_script';
import { getLongKoreaMyths, getShortKoreaMyths } from './prompt/korea-myths';
import { getLongHealth, getShortHealth } from './prompt/health';

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
      case 'History':
        return isLong ? getLongHistory : getShortHistory;
      case 'Science':
        return isLong ? getLongScience : getShortScience;
      case 'Art':
        return isLong ? getLongArt : getShortArt;
      case 'Psychology':
        return isLong ? getLongPsychology : getShortPsychology;
      case 'Trivia':
        return isLong ? getLongTrivia : getShortTrivia;
      case 'Health':
        return isLong ? getLongHealth : getShortHealth;

      // 숏폼 전용
      case 'Horoscope':
        return getShortHoroscope;
      case 'DogFood':
        return getShortDogFood;

      // 임시 테스트
      case 'Psychology-Script':
        return getLongPsychology_script;

      case 'Folktale_KR':
      case 'Folktale_CN':
      case 'Folktale_JP':
      case 'Folktale_DK':
      case 'Folktale_DE':
      case 'Folktale_FR':
      case 'Folktale':
        return isLong ? getLongFolktale : getShortFolktale;

      case 'korea-myths':
        return isLong ? getLongKoreaMyths : getShortKoreaMyths;
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

    for (let retry = 0; retry < 10; retry++) {
      try {
        const result = await process(this.openai, category, language ?? 'ko');

        await this.prisma.generatedStory.create({
          data: {
            category: category,
            content: result.story,
            formType: isLong ? 'LONG' : 'SHORT',
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
        await this.logger.logInfo(
          `텍스트 생성 에러 // retry : ${retry} /  ${e.message}`,
        );
      }
    }
    throw new InternalServerErrorException();
  }
}
