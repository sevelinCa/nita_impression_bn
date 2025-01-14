import {
  Body,
  Controller,
  Post,
  Put,
  Req,
  UseGuards,
  Param,
  Query,
  Get,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { MaterialsService } from './materials.service';
import { JwtService } from '@nestjs/jwt';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { Request } from 'express';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { PaginationQueryDto } from 'src/dto/pagination-query.dto';
import { Material } from 'src/typeorm/entities/Material.entity';

@Controller('materials')
export class MaterialsController {
  constructor(
    private readonly materialsService: MaterialsService,
    private readonly jwtService: JwtService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('create-material')
  @ApiOperation({ summary: 'Create a new material' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 201,
    description: 'The material has been successfully created.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request, invalid input or missing data.',
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found.',
  })
  async create(
    @Body() createMaterialDto: CreateMaterialDto,
    @Req() request: Request,
  ) {
    const token = request.headers.authorization.replace('Bearer ', '');
    const json = this.jwtService.decode(token, { json: true }) as {
      userId: string;
    };

    return this.materialsService.create(createMaterialDto, json.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/update-material')
  @ApiOperation({ summary: 'Update an existing material' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'The material has been successfully updated.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request, invalid input or missing data.',
  })
  @ApiResponse({
    status: 404,
    description: 'Material not found.',
  })
  async update(
    @Param('id') id: string,
    @Body() updateMaterialDto: UpdateMaterialDto,
    @Req() request: Request,
  ) {
    const token = request.headers.authorization.replace('Bearer ', '');
    const json = this.jwtService.decode(token, { json: true }) as {
      userId: string;
    };

    return this.materialsService.update(id, updateMaterialDto, json.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Get all materials' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved all materials.',
  })
  @ApiResponse({
    status: 404,
    description: 'No materials found.',
  })
  async findAll(
    @Req() request: Request,
    @Query() paginationQuery: PaginationQueryDto,
  ) {
    const token = request.headers.authorization.replace('Bearer ', '');
    const json = this.jwtService.decode(token, { json: true }) as {
      userId: string;
    };

    return this.materialsService.findAll(paginationQuery, json.userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':id')
  @ApiOperation({ summary: 'Get material by id' })
  @ApiResponse({
    status: 200,
    description: 'Material found',
    type: Material,
  })
  @ApiResponse({
    status: 404,
    description: 'Material not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden, only admin is allowed',
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request,
  ): Promise<Material> {
    const token = request.headers.authorization.replace('Bearer ', '');
    const json = this.jwtService.decode(token, { json: true }) as {
      userId: string;
    };

    return this.materialsService.findOne(id, json.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a material by id' })
  @ApiResponse({
    status: 200,
    description: 'Material successfully deleted',
  })
  @ApiResponse({
    status: 404,
    description: 'Material not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden, only admin is allowed',
  })
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request,
  ): Promise<{ message: string }> {
    const token = request.headers.authorization.replace('Bearer ', '');
    const json = this.jwtService.decode(token, { json: true }) as {
      userId: string;
    };
    return this.materialsService.delete(id, json.userId);
  }
}
