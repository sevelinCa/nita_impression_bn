import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/typeorm/entities/User.entity';
import * as bcrypt from 'bcrypt';
import { UserDto } from './dto/create-auth.dto';
import { AuthPayloadDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createAuthDto: UserDto) {
    const { email, password, fullName, age, ...userData } = createAuthDto;

    const existingUser = await this.userRepository.findOneBy({ email });
    if (existingUser) {
      throw new BadRequestException({
        message: 'User already exists',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = this.userRepository.create({
      ...userData,
      fullName,
      email,
      password: hashedPassword,
      age: age ? Number(age) : undefined,
    });

    const result = await this.userRepository.save(newUser);

    return {
      message: 'User created successfully',
      userId: result.id,
    };
  }

  async validateUser(authPayloadDto: AuthPayloadDto): Promise<any> {
    const { email, password } = authPayloadDto;

    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { userId: user.id, role: user.role };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '1y' });

    return {
      userId: user.id,
      accessToken,
    };
  }
}
