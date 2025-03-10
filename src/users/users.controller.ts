import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { PaginationQueryDto } from 'src/dto/pagination-query.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { CreateAdminDto } from './dto/create-admin.dto';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('new-admin')
  @ApiOperation({
    summary: 'Register a new admin',
    description: 'Creates a new admin account with email and password.',
  })
  @ApiBody({ type: CreateAdminDto })
  @ApiResponse({
    status: 201,
    description: 'admin successfully registered.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. The email might already be taken.',
  })
  create(@Body() createAuthDto: CreateAdminDto, @Req() request: Request) {
    const token = request.headers.authorization.replace('Bearer ', '');
    const json = this.jwtService.decode(token, { json: true }) as {
      userId: string;
    };
    return this.usersService.create(createAuthDto, json.userId);
  }

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
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('change-password')
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

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update admin information' })
  @ApiResponse({
    status: 200,
    description: 'Successfully updated the admin information',
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

  @UseGuards(JwtAuthGuard)
  @Put(':id/inactivate')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Inactivate a user ' })
  @ApiResponse({
    status: 200,
    description: 'User successfully inactivated',
  })
  @ApiResponse({
    status: 400,
    description: 'User is already inactive',
  })
  @ApiResponse({
    status: 403,
    description: 'Only admin is allowed to inactivate a user',
  })
  @ApiResponse({
    status: 404,
    description: 'User or Admin not found',
  })
  inactivateUser(
    @Param('id', ParseUUIDPipe) userId: string,
    @Req() request: Request,
  ) {
    const token = request.headers.authorization.replace('Bearer ', '');
    const json = this.jwtService.decode(token, { json: true }) as {
      userId: string;
    };
    return this.usersService.inactivateUser(userId, json.userId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update employee information' })
  @ApiResponse({
    status: 200,
    description: 'Successfully updated the employee information',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request',
  })
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  updateEmployee(
    @Body() updateUserDto: UpdateEmployeeDto,
    @Req() request: Request,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const token = request.headers.authorization.replace('Bearer ', '');
    const json = this.jwtService.decode(token, { json: true }) as {
      userId: string;
    };
    return this.usersService.updateEmployee(json.userId, updateUserDto, id);
  }
}
