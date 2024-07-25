import { IsIn, IsOptional, IsString } from 'class-validator';

export class GetShortTextDto {
  @IsOptional()
  @IsString()
  prompt: string;

  @IsString()
  @IsIn(['horror', 'horror_test', 'nietzsche'])
  category: string;

  @IsOptional()
  @IsIn(['ko', 'en', 'jp'])
  language: string;
}
