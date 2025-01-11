import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from 'src/typeorm/entities/Category.entity';
import { RentalMaterial } from 'src/typeorm/entities/RentalMaterial.entity';
import { User } from 'src/typeorm/entities/User.entity';
import { CreateRentalMaterialDto } from './dto/rental-materials.dto';
import { BaseService } from 'src/base.service';
import { PaginationQueryDto } from 'src/dto/pagination-query.dto';

@Injectable()
export class RentalMaterialsService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(RentalMaterial)
    private readonly rentalMaterialRepository: Repository<RentalMaterial>,
    private readonly baseService: BaseService,
  ) {}

  async create(createMaterialDto: CreateRentalMaterialDto, id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User Not Found');

    if (user.role !== 'admin')
      throw new ForbiddenException(
        'Only admin is allowed to create rental material',
      );

    const category = await this.categoryRepository.findOne({
      where: { id: createMaterialDto.categoryId },
    });

    if (!category) throw new NotFoundException('Category Not Found');

    const rentalMaterial = this.rentalMaterialRepository.create({
      ...createMaterialDto,
      category,
    });

    return await this.rentalMaterialRepository.save(rentalMaterial);
  }

  async update(
    id: string,
    updateMaterialDto: Partial<CreateRentalMaterialDto>,
    userId: string,
  ) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User Not Found');

    if (user.role !== 'admin')
      throw new ForbiddenException(
        'Only admin is allowed to update rental material',
      );

    const rentalMaterial = await this.rentalMaterialRepository.findOne({
      where: { id },
      relations: ['category'],
    });
    if (!rentalMaterial)
      throw new NotFoundException('Rental Material Not Found');

    if (updateMaterialDto.categoryId) {
      const category = await this.categoryRepository.findOne({
        where: { id: updateMaterialDto.categoryId },
      });
      if (!category) throw new NotFoundException('Category Not Found');
      rentalMaterial.category = category;
    }

    Object.assign(rentalMaterial, updateMaterialDto);

    return await this.rentalMaterialRepository.save(rentalMaterial);
  }

  async findAll(paginationQuery: PaginationQueryDto, id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (user === null) throw new NotFoundException('User Not Found');

    if (user.role !== 'admin')
      throw new ForbiddenException(
        'Only admin is allowed to view all materials',
      );
    const { skip, take } =
      this.baseService.initializePagination(paginationQuery);

    const [materials, totalCount] =
      await this.rentalMaterialRepository.findAndCount({
        take,
        skip,
      });

    return this.baseService.paginate(materials, totalCount, paginationQuery);
  }

  async findOne(id: string, userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User Not Found');

    if (user.role !== 'admin')
      throw new ForbiddenException(
        'Only admin is allowed to view rental materials',
      );

    const material = await this.rentalMaterialRepository.findOne({
      where: { id },
    });
    if (!material) throw new NotFoundException('Rental Material Not Found');

    return material;
  }
}
