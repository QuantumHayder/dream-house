import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { UserRole } from 'generated/prisma/client';

export class AuthDto {
  @IsOptional()
  @IsString()
  Fname: string;

  @IsOptional()
  @IsString()
  Lname: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  Role: UserRole;
}
