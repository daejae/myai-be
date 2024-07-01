import { IsIn, IsOptional, IsString } from 'class-validator';

export class GetGenerateText {
  @IsOptional()
  @IsString()
  prompt: string;

  @IsString()
  @IsIn([
    'fear',
    'horror',
    'greek_mythology',
    'socrates',
    'nietzsche',
    'fairytale',
  ])
  category: string;

  @IsOptional()
  @IsIn(['ko', 'en', 'jp'])
  language: string;
}
