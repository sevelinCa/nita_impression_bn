import {
  Controller,
  Post,
  Patch,
  Get,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RentalMaterialsService } from './rental-materials.service';
import { CreateRentalMaterialDto } from './dto/rental-materials.dto';
import { PaginationQueryDto } from 'src/dto/pagination-query.dto';
import { UpdateRentalMaterialDto } from './dto/update-rental-material.dto';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';

@ApiTags('Rental Materials')
@ApiBearerAuth()
@Controller('rental-materials')
export class RentalMaterialsController {
  constructor(
    private readonly rentalMaterialsService: RentalMaterialsService,
    private readonly jwtService: JwtService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Create a new rental material' })
  async create(
    @Body() createMaterialDto: CreateRentalMaterialDto,
    @Req() request: Request,
  ) {
    const token = request.headers.authorization.replace('Bearer ', '');
    const json = this.jwtService.decode(token, { json: true }) as {
      userId: string;
    };

    return this.rentalMaterialsService.create(createMaterialDto, json.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('inactive')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all inactive rental materials (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved inactive rental materials',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden, only admin is allowed',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async findInactiveRentalMaterials(
    @Query() paginationQuery: PaginationQueryDto,
    @Req() request: Request,
  ) {
    const token = request.headers.authorization.replace('Bearer ', '');
    const decoded = this.jwtService.decode(token, { json: true }) as {
      userId: string;
    };
    return this.rentalMaterialsService.findInactiveRentalMaterials(
      paginationQuery,
      decoded.userId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a rental material' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMaterialDto: UpdateRentalMaterialDto,
    @Req() request: Request,
  ) {
    const token = request.headers.authorization.replace('Bearer ', '');
    const json = this.jwtService.decode(token, { json: true }) as {
      userId: string;
    };

    return this.rentalMaterialsService.update(
      id,
      updateMaterialDto,
      json.userId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Get all rental materials with pagination' })
  async findAll(
    @Query() paginationQuery: PaginationQueryDto,
    @Req() request: Request,
  ) {
    const token = request.headers.authorization.replace('Bearer ', '');
    const json = this.jwtService.decode(token, { json: true }) as {
      userId: string;
    };

    return this.rentalMaterialsService.findAll(paginationQuery, json.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Get a specific rental material' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request,
  ) {
    const token = request.headers.authorization.replace('Bearer ', '');
    const json = this.jwtService.decode(token, { json: true }) as {
      userId: string;
    };

    return this.rentalMaterialsService.findOne(id, json.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/inactive')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark a rental material as inactive by id' })
  @ApiResponse({
    status: 200,
    description: 'Rental Material successfully marked as inactive',
  })
  @ApiResponse({
    status: 404,
    description: 'Rental Material not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden, only admin is allowed',
  })
  async markAsInactive(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request,
  ): Promise<{ message: string }> {
    const token = request.headers.authorization.replace('Bearer ', '');
    const decoded = this.jwtService.decode(token, { json: true }) as {
      userId: string;
    };

    await this.rentalMaterialsService.markAsInactive(id, decoded.userId);

    return { message: 'Rental Material successfully marked as inactive' };
  }
}
