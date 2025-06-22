import { IsNotEmpty, IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: '사용자 이름',
    example: '김철수',
    type: String,
  })
  @IsNotEmpty({ message: '이름은 필수입니다.' })
  @IsString({ message: '이름은 문자열이어야 합니다.' })
  name: string;

  @ApiProperty({
    description: '이메일 주소',
    example: 'user@example.com',
    type: String,
  })
  @IsNotEmpty({ message: '이메일은 필수입니다.' })
  @IsEmail({}, { message: '올바른 이메일 형식이 아닙니다.' })
  email: string;

  @ApiProperty({
    description: '비밀번호 (최소 6자 이상)',
    example: 'password123',
    type: String,
    minLength: 6,
  })
  @IsNotEmpty({ message: '비밀번호는 필수입니다.' })
  password: string;
}
