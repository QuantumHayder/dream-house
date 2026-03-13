import { IsOptional, IsString } from 'class-validator';

export class UserRequestDto {
  @IsString()
  @IsOptional()
  fname?: string;

  @IsString()
  @IsOptional()
  lname?: string;
}
