import { UserResponseDto } from '../dto/userResponse';
import { User } from 'generated/prisma/client';

export function toUserResponseDto(user: User): UserResponseDto {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    fname: user.fname,
    lname: user.lname,
    role: user.role,
    createdAt: user.createdAt,
  };
}
