import { IsOptional } from 'class-validator';
import { UserRole } from 'generated/prisma/client';

export class UserResponseDto {
  id: number;
  username: string;
  email: string;

  @IsOptional()
  fname: string | null;

  @IsOptional()
  lname: string | null;

  role: UserRole;
  createdAt: Date;
}
