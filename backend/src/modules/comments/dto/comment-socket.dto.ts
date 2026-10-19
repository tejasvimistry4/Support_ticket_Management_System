import { IsBoolean, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class JoinTicketWsDto {
  @IsString()
  @IsNotEmpty({ message: 'ticketId is required' })
  ticketId: string;
}

export class LeaveTicketWsDto {
  @IsString()
  @IsNotEmpty({ message: 'ticketId is required' })
  ticketId: string;
}

export class SendCommentWsDto {
  @IsString()
  @IsNotEmpty({ message: 'ticketId is required' })
  ticketId: string;

  @IsString()
  @IsNotEmpty({ message: 'Comment content cannot be empty' })
  @MaxLength(5000, { message: 'Comment cannot exceed 5000 characters' })
  content: string;
}

export class TypingWsDto {
  @IsString()
  @IsNotEmpty({ message: 'ticketId is required' })
  ticketId: string;

  @IsBoolean()
  isTyping: boolean;
}

export class EditCommentWsDto {
  @IsString()
  @IsNotEmpty({ message: 'ticketId is required' })
  ticketId: string;

  @IsString()
  @IsNotEmpty({ message: 'commentId is required' })
  commentId: string;

  @IsString()
  @IsNotEmpty({ message: 'Comment content cannot be empty' })
  @MaxLength(3000, { message: 'Comment cannot exceed 3000 characters' })
  content: string;
}

export class DeleteCommentWsDto {
  @IsString()
  @IsNotEmpty({ message: 'ticketId is required' })
  ticketId: string;

  @IsString()
  @IsNotEmpty({ message: 'commentId is required' })
  commentId: string;
}
