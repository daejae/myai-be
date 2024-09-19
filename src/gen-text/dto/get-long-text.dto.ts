import { IsIn, IsNumberString, IsOptional, IsString } from 'class-validator';

export class GetTextDto {
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
    'Folktale',
    'ScienceTest',

    'Psychology-Script',
  ])
  category: string;

  @IsOptional()
  @IsIn(['ko', 'en', 'jp'])
  language: string;

  @IsOptional()
  @IsNumberString()
  length: number;
}
