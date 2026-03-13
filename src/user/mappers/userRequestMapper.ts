import { UserRequestDto } from '../dto/userRequest';
import { User } from 'generated/prisma/client';

export function fromUserRequestDto(
  userRequestDto: UserRequestDto,
): Partial<User> {
  return {
    fname: userRequestDto.fname,
    lname: userRequestDto.lname,
  };
}
