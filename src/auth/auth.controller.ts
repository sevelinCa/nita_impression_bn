import {
  Body,
  Controller,
  HttpException,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { UserDto } from './dto/create-auth.dto';
import { LocalGuard } from './guards/local.guard';
import { AuthPayloadDto } from './dto/login.dto';

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
}
