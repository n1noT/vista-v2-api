import {
  IsArray,
  IsInt,
  IsOptional,
  Min,
  ValidateNested,
  ArrayUnique,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PredictionItemDto } from './prediction-item.dto';

export class CUPredictionsDto {
  @IsOptional()
  @Min(1)
  id?: number;

  @IsInt()
  @Min(1)
  leagueId!: number;

  @IsInt()
  @Min(1)
  seasonId!: number;

  @IsArray({ message: 'Les prédictions doivent être un tableau.' })
  @ValidateNested({ each: true })
  @Type(() => PredictionItemDto)
  @ArrayUnique((item: PredictionItemDto) => item.teamId, {
    message: 'Une même équipe ne peut pas apparaître plusieurs fois.',
  })
  @ArrayUnique((item: PredictionItemDto) => item.position, {
    message: 'Deux équipes ne peuvent pas avoir la même position.',
  })
  predictions!: PredictionItemDto[];
}
