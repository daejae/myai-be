import { IsIn, IsString } from 'class-validator';

export class GetGenerateText {
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
  category?: string;
}
