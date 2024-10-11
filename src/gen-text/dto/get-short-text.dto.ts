import { IsIn, IsOptional, IsString } from 'class-validator';

export class GetShortTextDto {
  @IsOptional()
  @IsString()
  prompt: string;

  @IsString()
  @IsIn([
    'horror',
    'philosophy',
    'History',
    'Science',
    'Art',
    'Psychology',
    'Trivia',
    'Horoscope',
    'Folktale',
    'DogFood',
    'ScienceTest',

    'Folktale_KR',
    'Folktale_CN',
    'Folktale_JP',
    'Folktale_DK',
    'Folktale_DE',
    'Folktale_FR',

    'korea-myths',
  ])
  category: string;

  @IsOptional()
  @IsIn(['ko', 'en', 'jp'])
  language: string;

  @IsOptional()
  @IsString()
  option1: string;
}
