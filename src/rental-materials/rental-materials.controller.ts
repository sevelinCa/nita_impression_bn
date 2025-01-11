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
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
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
  @Patch(':id')
  @ApiOperation({ summary: 'Update a rental material' })
  async update(
    @Param('id') id: string,
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
  async findOne(@Param('id') id: string, @Req() request: Request) {
    const token = request.headers.authorization.replace('Bearer ', '');
    const json = this.jwtService.decode(token, { json: true }) as {
      userId: string;
    };

    return this.rentalMaterialsService.findOne(id, json.userId);
  }
}
