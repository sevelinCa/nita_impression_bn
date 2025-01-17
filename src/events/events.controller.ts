import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Param,
  Query,
  ParseUUIDPipe,
  Put,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { PaginationQueryDto } from 'src/dto/pagination-query.dto';
import { ChangeStatusDto } from './dto/change-status.dto';

@ApiTags('Events')
@ApiBearerAuth()
@Controller('events')
@UseGuards(JwtAuthGuard)
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly jwtService: JwtService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create an event',
    description:
      'Creates a new event with the provided details. Requires user authentication.',
  })
  @ApiBody({
    description: 'Details of the event to create',
    type: CreateEventDto,
  })
  @ApiResponse({
    status: 201,
    description: 'The event has been successfully created.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. The user must be logged in with a valid token.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request. The input data is invalid.',
  })
  create(@Req() request: Request, @Body() createEventDto: CreateEventDto) {
    const token = request.headers.authorization.replace('Bearer ', '');
    const json = this.jwtService.decode(token, { json: true }) as {
      userId: string;
    };
    return this.eventsService.create(createEventDto, json.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('eventItems')
  @ApiOperation({ summary: 'Get all events items' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved all events items.',
  })
  async getEventItems(
    @Req() request: Request,
    @Query() paginationQuery: PaginationQueryDto,
  ) {
    const token = request.headers.authorization.replace('Bearer ', '');
    const json = this.jwtService.decode(token, { json: true }) as {
      userId: string;
    };
    return this.eventsService.eventItems(json.userId, paginationQuery);
  }

  @Get('event-details/:id')
  @ApiOperation({ summary: 'Get event by ID' })
  async eventDetails(
    @Param('id', ParseUUIDPipe) eventId: string,
    @Req() request: Request,
  ) {
    const token = request.headers.authorization.replace('Bearer ', '');
    const json = this.jwtService.decode(token, { json: true }) as {
      userId: string;
    };

    return this.eventsService.eventDetails(eventId, json.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiOperation({ summary: 'Update an event status' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the event to update',
  })
  async updateEventStatus(
    @Body() changeEventStatus: ChangeStatusDto,
    @Param('id', ParseUUIDPipe) eventId: string,
    @Req() request: Request,
  ) {
    const token = request.headers.authorization.replace('Bearer ', '');
    const json = this.jwtService.decode(token, { json: true }) as {
      userId: string;
    };
    return this.eventsService.updateEventStatusService(
      changeEventStatus,
      json.userId,
      eventId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Get all events' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved all events.',
  })
  @ApiResponse({
    status: 404,
    description: 'No events found.',
  })
  async findAll(
    @Req() request: Request,
    @Query() paginationQuery: PaginationQueryDto,
  ) {
    const token = request.headers.authorization.replace('Bearer ', '');
    const json = this.jwtService.decode(token, { json: true }) as {
      userId: string;
    };

    return this.eventsService.findAll(paginationQuery, json.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':employeeId')
  @ApiOperation({ summary: 'Get all events by a employee' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved all events by employee.',
  })
  @ApiResponse({
    status: 404,
    description: 'No events found.',
  })
  async findByUsers(
    @Req() request: Request,
    @Query() paginationQuery: PaginationQueryDto,
    @Param('employeeId', ParseUUIDPipe) employeeId: string,
  ) {
    const token = request.headers.authorization.replace('Bearer ', '');
    const json = this.jwtService.decode(token, { json: true }) as {
      userId: string;
    };

    return this.eventsService.findByUser(
      paginationQuery,
      json.userId,
      employeeId,
    );
  }
}
