import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpStatus,
  HttpCode,
  Version,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { AuthService } from '../modules/auth.service';
import { AdminGuard } from '../security/admin.guard';
import { LoginDto } from '../dto/login.dto';
import { LoginResponseDto, AdminResponseDto, ErrorResponseDto } from '../common/dto/responses';

/**
 * Controller for authentication-related endpoints
 */
@ApiTags('auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Version('1')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: LoginResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid request body',
    type: ErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials',
    type: ErrorResponseDto,
  })
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const token = await this.authService.generateToken({
      id: user.id,
      role: user.role,
    });

    return {
      accessToken: token,
      user: {
        id: user.id.toString(),
        email: user.email,
        role: user.role,
      },
    };
  }

  @UseGuards(AdminGuard)
  @Post('admin')
  @Version('1')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin only endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Admin access granted',
    type: AdminResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: ErrorResponseDto,
  })
  async adminOnly(): Promise<AdminResponseDto> {
    return { message: 'Admin access granted' };
  }
}
