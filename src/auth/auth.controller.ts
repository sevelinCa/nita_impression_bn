import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { UserDto } from './dto/create-auth.dto';
import { LocalGuard } from './guards/local.guard';
import { AuthPayloadDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Register a new user',
    description: 'Creates a new user account with email and password.',
  })
  @ApiBody({ type: UserDto })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. The email might already be taken.',
  })
  create(@Body() createAuthDto: UserDto) {
    return this.authService.create(createAuthDto);
  }

  @Post('login')
  @ApiOperation({
    summary: 'User login',
    description: 'Authenticate user with email and password.',
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful. Returns access token.',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials.',
  })
  @UseGuards(LocalGuard)
  login(@Body() authPayloadDto: AuthPayloadDto) {
    const user = this.authService.validateUser(authPayloadDto);
    if (!user) throw new HttpException('Invalid credentials', 401);
    return user;
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request a password reset email' })
  @ApiResponse({
    status: 200,
    description: 'Password reset email sent successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'User Not FOund',
  })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Post('verify-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify a password reset token' })
  @ApiResponse({
    status: 200,
    description: 'Token verification successful',
  })
  @ApiResponse({
    status: 400,
    description: 'Token is required or invalid',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        resetToken: {
          type: 'string',
          description: 'The password reset token to verify',
          example: 'abcdef123456',
        },
      },
      required: ['resetToken'],
    },
  })
  async verifyPassword(@Body('resetToken') resetToken: string) {
    if (!resetToken) {
      throw new BadRequestException('Token is required');
    }

    return this.authService.verifyPassword(resetToken);
  }

  @Post('reset-password/:token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset the user password using a reset token' })
  @ApiParam({
    name: 'token',
    description: "The unique reset token sent to the user's email",
    example: '12345',
  })
  async resetPassword(
    @Param('token') resetToken: string,
    @Body() resetPasswordDto: ResetPasswordDto,
  ) {
    return this.authService.resetPassword(resetToken, resetPasswordDto);
  }
}
