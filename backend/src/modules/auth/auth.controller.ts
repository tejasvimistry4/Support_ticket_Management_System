import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role } from '../../common/constants/roles.enum';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AuthService } from './auth.service';
import { AuthResponseDto, UserResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }


  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@GetUser() user: UserResponseDto): Promise<UserResponseDto> {
    return this.authService.getProfile(user.id);
  }


  @Get('admin-only')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  getAdminData(@GetUser() user: UserResponseDto) {
    return {
      message: 'Access granted: You are authorized as an ADMIN',
      authorizedUser: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      systemPrivileges: [
        'MANAGE_ALL_USERS',
        'DELETE_TICKETS',
        'SYSTEM_SETTINGS',
        'ANALYTICS_REPORTS',
      ],
      timestamp: new Date().toISOString(),
    };
  }

  @Get('agent-only')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPPORT_AGENT, Role.ADMIN)
  getAgentData(@GetUser() user: UserResponseDto) {
    return {
      message: 'Access granted: You have SUPPORT_AGENT / ADMIN permissions',
      authorizedUser: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      agentPrivileges: [
        'VIEW_ASSIGNED_TICKETS',
        'UPDATE_TICKET_STATUS',
        'REPLY_TO_CUSTOMERS',
        'CREATE_INTERNAL_NOTES',
      ],
      timestamp: new Date().toISOString(),
    };
  }

  @Get('users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async getAllUsers(
    @Query('role') role?: Role,
    @GetUser() user?: { id: string; role: Role },
  ): Promise<UserResponseDto[]> {
    return this.authService.getAllUsers(role, user);
  }
}
