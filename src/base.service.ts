import { Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';
import { PaginationQueryDto } from './dto/pagination-query.dto';

@Injectable()
export class BaseService {
  initializePagination(pagination: PaginationQueryDto): {
    skip: number;
    take: number;
  } {
    const page = Math.max(pagination.page, 1);
    const perPage = Math.max(pagination.perPage, 1);

    const offset = (page - 1) * perPage;

    return { skip: offset, take: perPage };
  }

  paginate(
    data: any[],
    totalCount: number,
    pagination: PaginationQueryDto,
  ): any {
    const lastPage = Math.ceil(totalCount / pagination.perPage);

    return {
      items: data,
      currentPage: pagination.page,
      lastPage,
      itemsPerPage: pagination.perPage,
      pageItems: data.length,
      total: totalCount,
      timestamp: DateTime.now().toFormat('yyyy-LL-dd, HH:mm:ss'),
    };
  }
}
