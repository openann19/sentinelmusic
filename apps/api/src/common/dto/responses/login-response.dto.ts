import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({
    description: 'User ID',
    example: '1',
  })
  id!: string;

  @ApiProperty({
    description: 'User email',
    example: 'user@example.com',
  })
  email!: string;

  @ApiProperty({
    description: 'User role',
    example: 'BASIC',
    enum: ['BASIC', 'DJ', 'ARTIST', 'LABEL', 'ADMIN'],
  })
  role!: string;
}

export class LoginResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken!: string;

  @ApiProperty({
    description: 'User information',
    type: UserDto,
  })
  user!: UserDto;
}
