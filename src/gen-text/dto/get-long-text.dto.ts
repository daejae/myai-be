import {
  IsIn,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';

export class GetLongTextDto {
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

  @IsOptional()
  @IsNumberString()
  length: number;
}