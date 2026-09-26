import { IsOptional } from 'class-validator';
import { UserRole, Unit } from 'generated/prisma/client';

export class UserResponseDto {
  id: number;
  username: string;
  email: string;

  @IsOptional()
  fname: string | null;

  @IsOptional()
  lname: string | null;

  @IsOptional()
  units: Unit[];

  @IsOptional()
  wishlist: Unit[];

  role: UserRole;
  createdAt: Date;
}
