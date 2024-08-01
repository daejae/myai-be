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
  ])
  category: string;

  @IsOptional()
  @IsIn(['ko', 'en', 'jp'])
  language: string;

  @IsOptional()
  @IsNumberString()
  length: number;
}
