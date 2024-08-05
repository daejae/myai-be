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
  ])
  category: string;

  @IsOptional()
  @IsIn(['ko', 'en', 'jp'])
  language: string;
}
