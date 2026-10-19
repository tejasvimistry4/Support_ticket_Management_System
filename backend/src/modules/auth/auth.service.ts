import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import { Role } from '../../common/constants/roles.enum';
import { PrismaService } from '../../database/prisma.service';
import { comparePassword, hashPassword } from '../../utils/password.util';
import { AuthResponseDto, UserResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  private sanitizeUser(user: {
    id: string;
    name: string;
    email: string;
    role: Role;
    createdAt: Date;
    updatedAt: Date;
  }): UserResponseDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private generateToken(user: { id: string; email: string; role: Role }): string {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    return this.jwtService.sign(payload);
  }

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const normalizedEmail = registerDto.email.trim().toLowerCase();

    const existingUser = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      throw new ConflictException(
        'An account with this email address already exists',
      );
    }

    try {
      const hashedPassword = await hashPassword(registerDto.password);

      const user = await this.prisma.user.create({
        data: {
          name: registerDto.name.trim(),
          email: normalizedEmail,
          password: hashedPassword,
          role: registerDto.role ?? Role.SUPPORT_AGENT,
        },
      });

      const accessToken = this.generateToken(user);

      return {
        user: this.sanitizeUser(user),
        accessToken,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to register user. Please try again later.',
      );
    }
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const normalizedEmail = loginDto.email.trim().toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await comparePassword(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const accessToken = this.generateToken(user);

    return {
      user: this.sanitizeUser(user),
      accessToken,
    };
  }

  async getProfile(userId: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User profile not found');
    }

    return user;
  }

  async getAllUsers(
    role?: Role,
    currentUser?: { id: string; role: Role },
  ): Promise<UserResponseDto[]> {
    const where: Prisma.UserWhereInput = {};

    if (currentUser?.role === Role.ADMIN) {
      where.OR = [
        { role: Role.SUPPORT_AGENT },
        { id: currentUser.id },
      ];
    } else if (currentUser?.role === Role.SUPPORT_AGENT) {
      where.id = currentUser.id;
    }

    if (role) {
      where.role = role;
    }

    const users = await this.prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        assignedTickets: {
          where:
            currentUser?.role === Role.ADMIN
              ? { createdById: currentUser.id }
              : undefined,
          select: {
            id: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
      assignedTicketCount: u.assignedTickets.length,
      inProgressTicketCount: u.assignedTickets.filter(
        (t) => t.status === 'IN_PROGRESS',
      ).length,
    }));
  }
}
