import { IsIn, IsString } from 'class-validator';

export class GetGenerateText {
  @IsString()
  prompt: string;

  @IsString()
  @IsIn(['fear', 'sports', 'entertainment', 'technology'])
  category?: string;
}
