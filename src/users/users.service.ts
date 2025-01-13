import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/base.service';
import { PaginationQueryDto } from 'src/dto/pagination-query.dto';
import { User } from 'src/typeorm/entities/User.entity';
import { Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private readonly baseService: BaseService,
  ) {}

  async findAll(paginationQuery: PaginationQueryDto) {
    const { skip, take } =
      this.baseService.initializePagination(paginationQuery);
    const [users, totalCount] = await this.userRepository.findAndCount({
      take,
      skip,
    });

    return this.baseService.paginate(users, totalCount, paginationQuery);
  }

  async findOne(userId: string) {
    const user = await this.userRepository.findOneBy({ id: userId });
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new NotFoundException('User Not Found');
    const result = this.userRepository.save({ ...user, ...updateUserDto });
    return result;
  }

  async changePassword(id: string, changePasswordDto: ChangePasswordDto) {
    const { oldPassword, newPassword, confirmPassword } = changePasswordDto;

    if (newPassword !== confirmPassword) {
      throw new BadRequestException(
        'New password and confirm password do not match',
      );
    }

    const user = await this.userRepository.findOneBy({ id });
    if (user === null) {
      throw new NotFoundException('User Not Found');
    }

    if (user.role !== 'admin') {
      throw new BadRequestException('only admin is allowed to change password');
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Old password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await this.userRepository.save(user);

    return { message: 'Password updated successfully' };
  }

  async delete(userId: string, adminId: string) {
    const admin = await this.userRepository.findOne({ where: { id: adminId } });

    if (!admin) throw new NotFoundException('Admin Not Found');

    if (admin.role !== 'admin') {
      throw new ForbiddenException(
        'Only admin is allowed to delete an employee',
      );
    }

    const employee = await this.userRepository.findOneBy({ id: userId });

    if (employee === null) throw new NotFoundException('Employee Not Found');

    await this.userRepository.remove(employee);

    return { message: `${employee.fullName} deleted successfully` };
  }
}
