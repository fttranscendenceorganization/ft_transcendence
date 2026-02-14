import { IsIn, IsString } from 'class-validator';

export class RespondFriendRequestDto {
  @IsString()
  @IsIn(['ACCEPT', 'REJECT'])
  action: 'ACCEPT' | 'REJECT';
}
