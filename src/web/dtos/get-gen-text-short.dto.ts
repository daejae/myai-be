import { IsIn, IsOptional, IsString } from 'class-validator';

export class GetGenerateText {
  @IsOptional()
  @IsString()
  prompt: string;

  @IsString()
  @IsIn(['horror'])
  category: string;

  @IsOptional()
  @IsIn(['ko', 'en', 'jp'])
  language: string;
}
