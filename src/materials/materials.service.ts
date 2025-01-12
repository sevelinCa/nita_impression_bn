import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from 'src/typeorm/entities/Category.entity';
import { Material } from 'src/typeorm/entities/Material.entity';
import { User } from 'src/typeorm/entities/User.entity';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { CreateMaterialDto } from './dto/create-material.dto';
import { BaseService } from 'src/base.service';
import { PaginationQueryDto } from 'src/dto/pagination-query.dto';

@Injectable()
export class MaterialsService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Material)
    private readonly materialRepository: Repository<Material>,
    private readonly baseService: BaseService,
  ) {}

  async create(createMaterialDto: CreateMaterialDto, id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User Not Found');

    if (user.role !== 'admin')
      throw new ForbiddenException('Only admin is allowed to create material');

    const category = await this.categoryRepository.findOne({
      where: { id: createMaterialDto.categoryId },
    });

    if (!category) throw new NotFoundException('Category Not Found');

    const material = this.materialRepository.create({
      ...createMaterialDto,
      category,
    });
    return await this.materialRepository.save(material);
  }

  async update(
    id: string,
    updateMaterialDto: UpdateMaterialDto,
    userId: string,
  ) {
    const material = await this.materialRepository.findOne({ where: { id } });
    if (!material) throw new NotFoundException('Material Not Found');

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || user.role !== 'admin')
      throw new ForbiddenException('Only admin is allowed to update material');

    if (updateMaterialDto.name) material.name = updateMaterialDto.name;
    if (updateMaterialDto.quantity)
      material.quantity = updateMaterialDto.quantity;
    if (updateMaterialDto.price) material.price = updateMaterialDto.price;
    if (updateMaterialDto.rentalPrice)
      material.rentalPrice = updateMaterialDto.rentalPrice;

    const updatedMaterial = await this.materialRepository.save(material);
    return updatedMaterial;
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

    const [materials, totalCount] = await this.materialRepository.findAndCount({
      take,
      skip,
    });

    return this.baseService.paginate(materials, totalCount, paginationQuery);
  }

  async findOne(id: string, userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User Not Found');

    if (user.role !== 'admin')
      throw new ForbiddenException('Only admin is allowed to view materials');

    const material = await this.materialRepository.findOne({ where: { id } });
    if (!material) throw new NotFoundException('Material Not Found');

    return material;
  }

  async delete(id: string, userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User Not Found');

    if (user.role !== 'admin')
      throw new ForbiddenException('Only admin is allowed to delete materials');

    const material = await this.materialRepository.findOne({ where: { id } });
    if (!material) throw new NotFoundException('Material Not Found');

    await this.materialRepository.remove(material);
    return { message: 'Material successfully deleted' };
  }
}
