import { IsInt, Min } from 'class-validator';

export class PredictionItemDto {
  @IsInt()
  @Min(1)
  teamId!: number;

  @IsInt()
  @Min(1)
  position!: number;
}
