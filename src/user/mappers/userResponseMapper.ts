import { UserResponseDto } from '../dto/userResponse';
import { User, Unit } from 'generated/prisma/client';

export function toUserResponseDto(
  user: User & { units?: Unit[]; wishList?: Unit[] },
): UserResponseDto {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    fname: user.fname,
    lname: user.lname,
    units: user.units ?? [],
    wishlist: user.wishList ?? [],
    role: user.role,
    createdAt: user.createdAt,
  };
}
