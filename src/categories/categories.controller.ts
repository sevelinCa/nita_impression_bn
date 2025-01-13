import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { CreateCategoryDto } from './dto/create-category.dto';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { JwtService } from '@nestjs/jwt';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly jwtService: JwtService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('create-category')
  @ApiOperation({ summary: 'Create a new category' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 201,
    description: 'The category has been successfully created.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request, invalid input or missing data.',
  })
  create(
    @Body() createCategoryDto: CreateCategoryDto,
    @Req() request: Request,
  ) {
    const token = request.headers.authorization.replace('Bearer ', '');
    const json = this.jwtService.decode(token, { json: true }) as {
      userId: string;
    };
    return this.categoriesService.create(createCategoryDto, json.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all categories' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved all categories.',
  })
  @ApiResponse({
    status: 404,
    description: 'Categories not found.',
  })
  findAll() {
    return this.categoriesService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiOperation({ summary: 'Update a category' })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: 'The ID of the category to update',
    required: true,
  })
  async update(
    @Body() updateCategoryDto: UpdateCategoryDto,
    @Param('id', ParseUUIDPipe) categoryId: string,
    @Req() request: Request,
  ) {
    const token = request.headers.authorization.replace('Bearer ', '');
    const json = this.jwtService.decode(token, { json: true }) as {
      userId: string;
    };

    return this.categoriesService.update(
      updateCategoryDto,
      categoryId,
      json.userId,
    );
  }
}
