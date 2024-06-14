import { GenerateImage_gpuPriority } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';

const samplerList = [
  'Euler a',
  'Euler',
  'LMS',
  'Heun',
  'DPM2',
  'DPM2 a',
  'DPM++ 2S a',
  'DPM++ 2M',
  'DPM++ SDE',
  'DPM fast',
  'DPM adaptive',
  'LMS Karras',
  'DPM2 Karras',
  'DPM2 a Karras',
  'DPM++ 2S a Karras',
  'DPM++ 2M Karras',
  'DPM++ SDE Karras',
  'DPM++ 2M SDE',
  'DPM++ 2M SDE Karras',
  'DDIM',
  'PLMS',
  'UniPC',
];

export class CreateThumbnailDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(190)
  userName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(190)
  saveTime: string;

  @IsBoolean()
  includePerson: boolean;

  @IsOptional()
  @IsString()
  story: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  modelId: number;

  @IsOptional()
  @IsInt()
  vaeId: number;

  @IsOptional()
  @IsIn(samplerList)
  sampler: string;

  @IsOptional()
  @IsInt()
  steps: number;

  @IsOptional()
  @IsInt()
  width: number;

  @IsOptional()
  @IsInt()
  height: number;

  @IsOptional()
  @IsInt()
  seed: number;

  @IsOptional()
  @IsEnum(GenerateImage_gpuPriority)
  gpuType: GenerateImage_gpuPriority;

  @IsOptional()
  upscale: {
    denoising_strength: number;
    upscaler: string;
    scale: number;
    resize_x: number;
    resize_y: number;
  };
}
