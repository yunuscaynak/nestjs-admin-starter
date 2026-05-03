import { Body, Controller, Get, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { HttpErrorResponseDto } from '../common/dto/http-error-response.dto';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { AuthService, type AuthResponse } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import type { AuthenticatedUser } from './auth.types';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @ApiOperation({
    summary: 'Yeni hesap olustur',
    description:
      'Ilk kayit olan kullanici admin olur, sonraki kayitlar user roluyle acilir.',
  })
  @ApiCreatedResponse({
    description: 'Kayit olma basarili.',
    type: AuthResponseDto,
  })
  @ApiConflictResponse({
    description: 'E-posta zaten kullanimda.',
    type: HttpErrorResponseDto,
  })
  @Post('register')
  register(@Body() registerDto: RegisterDto): Promise<AuthResponse> {
    return this.authService.register(registerDto);
  }

  @Public()
  @ApiOperation({
    summary: 'Giris yap',
    description: 'E-posta ve sifre ile JWT token dondurur.',
  })
  @ApiOkResponse({
    description: 'Giris basarili.',
    type: AuthResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Kimlik bilgileri gecersiz.',
    type: HttpErrorResponseDto,
  })
  @Post('login')
  login(@Body() loginDto: LoginDto): Promise<AuthResponse> {
    return this.authService.login(loginDto);
  }

  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Aktif kullaniciyi getir',
    description: 'Token icindeki kullanicinin guncel profilini dondurur.',
  })
  @ApiOkResponse({
    description: 'Kullanici profili getirildi.',
    type: UserResponseDto,
  })
  @Get('me')
  me(@CurrentUser() user: AuthenticatedUser): Promise<UserResponseDto> {
    return this.authService.me(user.id);
  }
}
