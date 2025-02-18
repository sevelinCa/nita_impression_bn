import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ReturnService } from './returns.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { CreateReturnDto } from './dto/create-return.dto';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { JwtService } from '@nestjs/jwt';
import { PaginationQueryDto } from 'src/dto/pagination-query.dto';
import { UpdateReturnDto } from './dto/update-return.tdto';

@Controller('returns')
export class ReturnsController {
  constructor(
    private readonly returnsService: ReturnService,
    private readonly jwtService: JwtService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new return' })
  @ApiBody({ type: CreateReturnDto })
  @ApiResponse({
    status: 201,
    description: 'Return successfully created',
    schema: {
      properties: {
        message: { type: 'string', example: 'Returns processed successfully' },
        event: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'uuid' },
            status: { type: 'string', example: 'closed' },
          },
        },
        returns: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              returnedQuantity: { type: 'number' },
              remainingQuantity: { type: 'number' },
              status: { type: 'string' },
              materialId: { type: 'string', nullable: true },
              rentalMaterialId: { type: 'string', nullable: true },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden - User is not a worker' })
  @ApiResponse({ status: 404, description: 'Event or User not found' })
  async createReturn(
    @Body() createReturnDto: CreateReturnDto,
    @Req() request: Request,
  ) {
    const token = request.headers.authorization.replace('Bearer ', '');
    const decoded = this.jwtService.decode(token, { json: true }) as {
      userId: string;
    };
    return this.returnsService.createReturn(createReturnDto, decoded.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update return' })
  @ApiBody({ type: UpdateReturnDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden - User is not a worker' })
  @ApiResponse({ status: 404, description: 'Event or User not found' })
  async updateReturn(
    @Body() updateReturnDto: UpdateReturnDto,
    @Req() request: Request,
  ) {
    const token = request.headers.authorization.replace('Bearer ', '');
    const decoded = this.jwtService.decode(token, { json: true }) as {
      userId: string;
    };
    return this.returnsService.updateReturn(updateReturnDto, decoded.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('event/:eventId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get returns for a specific event' })
  @ApiParam({
    name: 'eventId',
    description: 'ID of the event to get returns for',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns for the event retrieved successfully',
  })
  @ApiResponse({ status: 403, description: 'Forbidden - User is not a worker' })
  @ApiResponse({ status: 404, description: 'Event or User not found' })
  async getReturnsByEvent(
    @Param('eventId') eventId: string,
    @Req() request: Request,
  ) {
    const token = request.headers.authorization.replace('Bearer ', '');
    const decoded = this.jwtService.decode(token, { json: true }) as {
      userId: string;
    };
    return this.returnsService.getReturnsByEvent(eventId, decoded.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all returns with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Returns retrieved successfully',
  })
  @ApiResponse({ status: 403, description: 'Forbidden - User is not an admin' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findAll(
    @Query() paginationQuery: PaginationQueryDto,
    @Req() request: Request,
  ) {
    const token = request.headers.authorization.replace('Bearer ', '');
    const decoded = this.jwtService.decode(token, { json: true }) as {
      userId: string;
    };
    return this.returnsService.findAll(paginationQuery, decoded.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('status/:status')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all returns by status' })
  @ApiResponse({
    status: 200,
    description: 'Returns retrieved successfully',
  })
  @ApiResponse({ status: 403, description: 'Forbidden - User is not an admin' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getReturnsByStatus(
    @Query() paginationQuery: PaginationQueryDto,
    @Req() request: Request,
    @Param('status') status: string,
  ) {
    if (!['complete', 'incomplete'].includes(status)) {
      throw new BadRequestException(
        'Invalid status. Status must be either "complete" or "incomplete".',
      );
    }
    const token = request.headers.authorization.replace('Bearer ', '');
    const decoded = this.jwtService.decode(token, { json: true }) as {
      userId: string;
    };
    return this.returnsService.getReturnsByStatus(
      paginationQuery,
      decoded.userId,
      status,
    );
  }
}
