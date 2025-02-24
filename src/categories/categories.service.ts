import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from 'src/typeorm/entities/Category.entity';
import { Repository } from 'typeorm';
import { User } from 'src/typeorm/entities/User.entity';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}
  async create(createCategoryDto: CreateCategoryDto, userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User Not Found');

    if (user.role !== 'admin')
      throw new ForbiddenException('only admin is allowed to create category');
    const categoryDuplicate = await this.categoryRepository.findOne({
      where: { name: createCategoryDto.name },
    });
    if (categoryDuplicate)
      throw new ConflictException('category already exists');
    const collection = this.categoryRepository.create(createCategoryDto);
    return this.categoryRepository.save(collection);
  }

  async update(
    updateCategoryDto: UpdateCategoryDto,
    categoryId: string,
    userId: string,
  ) {
    const admin = await this.userRepository.findOne({ where: { id: userId } });

    if (!admin) throw new NotFoundException('Admin Not Found');

    if (admin.role !== 'admin') {
      throw new ForbiddenException('Only admin is allowed to update category');
    }

    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
    });

    if (category === null) {
      throw new NotFoundException('Category Not Found');
    }

    category.name = updateCategoryDto.name;
    return this.categoryRepository.save(category);
  }

  async findAll() {
    const categories = await this.categoryRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
    return categories;
  }
}
