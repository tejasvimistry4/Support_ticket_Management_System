import { Role } from '../../../common/constants/roles.enum';

export class UserResponseDto {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
  assignedTicketCount?: number;
  inProgressTicketCount?: number;
}

export class AuthResponseDto {
  user: UserResponseDto;
  accessToken: string;
}
