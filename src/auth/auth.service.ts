import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { User } from 'src/typeorm/entities/User.entity';
import * as bcrypt from 'bcrypt';
import { UserDto } from './dto/create-auth.dto';
import { AuthPayloadDto } from './dto/login.dto';
import { MailService } from 'src/mail/mail.service';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject() private readonly mailService: MailService,
  ) {}

  async create(createAuthDto: UserDto) {
    const { email, fullName, age, ...userData } = createAuthDto;

    const existingUser = await this.userRepository.findOneBy({ email });
    if (existingUser) {
      throw new BadRequestException({
        message: 'User already exists',
      });
    }

    if (createAuthDto.password) {
      const hashedPassword = await bcrypt.hash(createAuthDto.password, 10);

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

  async forgotPassword(email: string) {
    const user = await this.userRepository.findOneBy({ email });
    if (user === null) throw new NotFoundException('User Not Found');
    if (user) {
      const resetToken = Math.floor(10000 + Math.random() * 90000).toString();
      const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

      await this.userRepository.update(
        { email },
        {
          resetPasswordToken: resetToken,
          resetPasswordExpires: otpExpiresAt,
        },
      );

      await this.mailService.sendPasswordResetEmail(
        email,
        resetToken,
        user.fullName,
      );
    }
    return { message: 'Password reset email sent successfully' };
  }

  async resetPassword(resetToken: string, resetPasswordDto: ResetPasswordDto) {
    const { password, confirmPassword } = resetPasswordDto;
    if (password !== confirmPassword) {
      throw new BadRequestException('Passwords must be equal');
    }

    const token = await this.userRepository.findOne({
      where: { resetPasswordToken: resetToken },
    });

    if (!token) {
      throw new UnauthorizedException('Incorrect token');
    }
    if (token.resetPasswordExpires < new Date()) {
      throw new BadRequestException(
        'Token has expired. Please request a new one.',
      );
    }

    token.resetPasswordToken = null;
    token.resetPasswordExpires = null;
    await this.userRepository.save(token);

    const user = await this.userRepository.findOneBy({ id: token.id });
    if (user) {
      user.password = await bcrypt.hash(password, 10);
      await this.userRepository.save(user);

      return { message: 'Password changed successfully' };
    }

    throw new BadRequestException('User not found');
  }

  async verifyPassword(resetToken: string) {
    if (!resetToken) {
      throw new BadRequestException('Token is required');
    }

    const user = await this.userRepository.findOne({
      where: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: MoreThanOrEqual(new Date()),
      },
    });

    if (!user) {
      throw new UnauthorizedException(
        'Password reset token is invalid or has expired',
      );
    }

    return { token: user.resetPasswordToken };
  }
}
