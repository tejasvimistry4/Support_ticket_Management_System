import { Role } from '../../../common/constants/roles.enum';

export class CommentAuthorDto {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export class CommentResponseDto {
  id: string;
  content: string;
  ticketId: string;
  authorId: string;
  author: CommentAuthorDto;
  createdAt: Date;
  updatedAt: Date;
}
