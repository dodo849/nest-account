import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: '로그인 이메일',
    example: 'user@example.com',
  })
  @IsNotEmpty({ message: '이메일은 필수입니다.' })
  @IsEmail({}, { message: '올바른 이메일 형식이 아닙니다.' })
  email: string;

  @ApiProperty({
    description: '로그인 비밀번호',
    example: 'password123',
  })
  @IsNotEmpty({ message: '비밀번호는 필수입니다.' })
  password: string;
}
