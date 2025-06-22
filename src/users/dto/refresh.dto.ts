import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshDto {
  @ApiProperty({
    description: '리프레시 토큰',
  })
  @IsNotEmpty({ message: '리프레시 토큰은 필수입니다.' })
  refreshToken: string;
}
