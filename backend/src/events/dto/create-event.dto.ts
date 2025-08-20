import { IsString, IsNotEmpty, IsDateString, IsNumber, IsOptional, IsEnum } from 'class-validator';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  sport: string;

  @IsString()
  @IsNotEmpty()
  eventName: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsDateString()
  @IsNotEmpty()
  eventTime: string;

  @IsString()
  @IsNotEmpty()
  teamA: string;

  @IsString()
  @IsNotEmpty()
  teamB: string;

  @IsNumber()
  @IsOptional()
  scoreA?: number;

  @IsNumber()
  @IsOptional()
  scoreB?: number;

  @IsEnum(['Planlandı', 'Canlı', 'Bitti'])
  @IsOptional()
  status?: string;
}
