import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PaginationQueryDto } from 'src/dto/pagination-query.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  @ApiOperation({ summary: 'Get all users with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved all users',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request',
  })
  @Get()
  findAll(@Query() paginationDto: PaginationQueryDto) {
    return this.usersService.findAll(paginationDto);
  }

  @ApiOperation({ summary: 'Get a single user by ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved the user',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user information' })
  @ApiResponse({
    status: 200,
    description: 'Successfully updated the user information',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request',
  })
  @UseGuards(JwtAuthGuard)
  @Patch()
  update(@Body() updateUserDto: UpdateUserDto, @Req() request: Request) {
    const token = request.headers.authorization.replace('Bearer ', '');
    const json = this.jwtService.decode(token, { json: true }) as {
      userId: string;
    };
    return this.usersService.update(json.userId, updateUserDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({
    status: 200,
    description: 'Successfully changed the password',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request',
  })
  @UseGuards(JwtAuthGuard)
  @Put('change-password')
  changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Req() request: Request,
  ) {
    const token = request.headers.authorization.replace('Bearer ', '');
    const json = this.jwtService.decode(token, { json: true }) as {
      userId: string;
    };
    return this.usersService.changePassword(json.userId, changePasswordDto);
  }
}
