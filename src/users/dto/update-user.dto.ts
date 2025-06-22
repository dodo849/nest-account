import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({
    description: '사용자 이름 (선택적)',
    example: '김영희',
  })
  name?: string;

  @ApiPropertyOptional({
    description: '이메일 주소 (선택적)',
    example: 'newemail@example.com',
  })
  email?: string;

  @ApiPropertyOptional({
    description: '새 비밀번호 (선택적, 최소 6자 이상)',
    example: 'newpassword123',
    minLength: 6,
  })
  password?: string;
}
