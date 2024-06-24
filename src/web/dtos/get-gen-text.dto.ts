import { IsIn, IsString } from 'class-validator';

export class GetGenerateText {
  @IsString()
  prompt: string;

  @IsString()
  @IsIn(['fear'])
  category?: string;
}
