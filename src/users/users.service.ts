import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/base.service';
import { PaginationQueryDto } from 'src/dto/pagination-query.dto';
import { User } from 'src/typeorm/entities/User.entity';
import { Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcryptjs';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { CreateAdminDto } from './dto/create-admin.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private readonly baseService: BaseService,
  ) {}

  async create(createAuthDto: CreateAdminDto, userId: string) {
    const admin = await this.userRepository.findOne({ where: { id: userId } });

    if (!admin) throw new NotFoundException('Admin Not Found');

    if (admin.role !== 'admin') {
      throw new ForbiddenException(
        'Only admin is allowed to inactivate a user',
      );
    }

    const { email, fullName, age, ...userData } = createAuthDto;

    const existingUser = await this.userRepository.findOneBy({ email });
    if (existingUser) {
      throw new BadRequestException({
        message: 'Admin already exists',
      });
    }

    if (createAuthDto.password) {
      const hashedPassword = await bcrypt.hash(createAuthDto.password, 10);

      const newUser = this.userRepository.create({
        ...userData,
        fullName,
        email,
        role: 'admin',
        password: hashedPassword,
        age: age ? age : undefined,
      });
      const result = await this.userRepository.save(newUser);
      return {
        message: 'Admin created successfully',
        userId: result.id,
      };
    }

    const newUser = this.userRepository.create({
      ...userData,
      fullName,
      email,
      age: age ? Number(age) : undefined,
    });
    const result = await this.userRepository.save(newUser);
    return {
      message: 'User created successfully',
      userId: result.id,
    };
  }

  async findAll(paginationQuery: PaginationQueryDto) {
    const { skip, take } =
      this.baseService.initializePagination(paginationQuery);
    const [users, totalCount] = await this.userRepository.findAndCount({
      take,
      skip,
      order: {
        createdAt: 'DESC',
      },
    });

    return this.baseService.paginate(users, totalCount, paginationQuery);
  }

  async findOne(userId: string) {
    const user = await this.userRepository.findOneBy({ id: userId });
    return user;
  }

  async inactivateUser(userId: string, adminId: string) {
    const admin = await this.userRepository.findOne({ where: { id: adminId } });

    if (!admin) throw new NotFoundException('Admin Not Found');

    if (admin.role !== 'admin') {
      throw new ForbiddenException(
        'Only admin is allowed to inactivate a user',
      );
    }

    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) throw new NotFoundException('User Not Found');

    if (user.role !== 'worker') {
      throw new BadRequestException('Only worker is allowed to be inactivated');
    }

    if (user.status === 'inactive') {
      throw new BadRequestException('User is already inactive');
    }

    user.status = 'inactive';
    await this.userRepository.save(user);

    return { message: `${user.fullName} has been inactivated successfully` };
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new NotFoundException('User Not Found');
    const result = this.userRepository.save({ ...user, ...updateUserDto });
    return result;
  }

  async updateEmployee(
    id: string,
    updateUserDto: UpdateEmployeeDto,
    userId: string,
  ) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new UnauthorizedException();

    if (user.role !== 'admin') {
      throw new ForbiddenException(
        'You are not allowed to update employee information',
      );
    }

    const employee = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (employee === null) {
      throw new NotFoundException('Employee Not Found');
    }

    if (employee.role !== 'worker') {
      throw new BadRequestException('Must be employee not admin buddy!');
    }

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
