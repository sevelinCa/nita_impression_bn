import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';

@ApiTags('Reports')
@Controller('reports')
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly jwtService: JwtService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('yearly')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get yearly report' })
  @ApiResponse({
    status: 200,
    description: 'Yearly report generated successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: {
          type: 'object',
          properties: {
            income: { type: 'number', example: 50000 },
            expense: { type: 'number', example: 2000 },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getYearlyReport(@Req() request: Request) {
    const token = request.headers.authorization.replace('Bearer ', '');
    const json = this.jwtService.decode(token, { json: true }) as {
      userId: string;
    };

    return await this.reportsService.yearlyReport(json.userId);
  }
}
