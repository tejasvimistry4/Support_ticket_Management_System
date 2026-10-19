import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateCommentDto {
  @IsNotEmpty({ message: 'Comment content cannot be empty' })
  @IsString({ message: 'Comment content must be a string' })
  @MinLength(1, { message: 'Comment must be at least 1 character long' })
  @MaxLength(3000, { message: 'Comment cannot exceed 3000 characters' })
  content: string;
}
