import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';

export class AddMemberRequestDto {
  @ApiProperty({ example: '60d5ecb8b392d511f8b1c411' })
  @IsMongoId()
  userId!: string;
}
