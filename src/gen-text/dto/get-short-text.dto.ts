import { IsIn, IsOptional, IsString } from 'class-validator';

export class GetShortTextDto {
  @IsOptional()
  @IsString()
  prompt: string;

  @IsString()
  @IsIn([
    'horror',
    'philosophy',
    'history',
    'science',
    'art',
    'psychology',
    'trivia',
    'horoscope',
    'pet',
    'folktale',
  ])
  category: string;

  @IsOptional()
  @IsIn(['ko', 'en', 'jp'])
  language: string;
}
