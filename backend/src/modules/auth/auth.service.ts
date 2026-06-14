import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { AuthRepository } from './auth.repository';
import { LoginDto, RegisterDto, AuthResponseDto } from './auth.dto';
import { config } from '../../config/env';
import { AppError } from '../../middleware/error.middleware';
import { logger } from '../../utils/logger';

export class AuthService {
  private repo = new AuthRepository();

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    // Find by email
    const employee = await this.repo.findByEmail(dto.email);
    if (!employee) {
      throw new AppError('Invalid credentials', 401);
    }

    // Verify employee ID
    if (employee.employee_id !== dto.employeeId) {
      throw new AppError('Invalid credentials', 401);
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(dto.password, employee.password_hash);
    if (!isValidPassword) {
      throw new AppError('Invalid credentials', 401);
    }

    // Update last login
    await this.repo.updateLastLogin(employee.id);

    // Generate tokens
    const accessToken = this.generateAccessToken(employee);
    const refreshToken = this.generateRefreshToken(employee.id);

    // Save refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (dto.rememberMe ? 30 : 7));
    await this.repo.saveRefreshToken(employee.id, refreshToken, expiresAt);

    logger.info(`User logged in: ${employee.email}`);

    return {
      accessToken,
      refreshToken,
      expiresIn: config.jwt.expiresIn,
      user: {
        id: employee.id,
        employeeId: employee.employee_id,
        email: employee.email,
        firstName: employee.first_name,
        lastName: employee.last_name,
        role: employee.role,
        department: employee.department,
        designation: employee.designation,
        avatarUrl: employee.avatar_url,
      },
    };
  }

  async register(dto: RegisterDto): Promise<{ message: string }> {
    const existing = await this.repo.findByEmail(dto.email);
    if (existing) {
      throw new AppError('Email already registered', 409);
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(dto.password, saltRounds);
    await this.repo.createEmployee(dto, passwordHash);

    return { message: 'Employee registered successfully' };
  }

  async refreshToken(token: string): Promise<{ accessToken: string }> {
    const stored = await this.repo.findRefreshToken(token);
    if (!stored) {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    try {
      jwt.verify(token, config.jwt.refreshSecret);
    } catch {
      await this.repo.revokeRefreshToken(token);
      throw new AppError('Invalid refresh token', 401);
    }

    const employee = await this.repo.findById(stored.employee_id);
    if (!employee) {
      throw new AppError('User not found', 404);
    }

    const accessToken = this.generateAccessToken(employee);
    return { accessToken };
  }

  async logout(employeeId: string, refreshToken?: string): Promise<void> {
    if (refreshToken) {
      await this.repo.revokeRefreshToken(refreshToken);
    } else {
      await this.repo.revokeAllUserTokens(employeeId);
    }
  }

  async getProfile(userId: string): Promise<any> {
    const employee = await this.repo.findById(userId);
    if (!employee) {
      throw new AppError('User not found', 404);
    }
    return employee;
  }

  private generateAccessToken(employee: any): string {
    return jwt.sign(
      {
        userId: employee.id,
        employeeId: employee.employee_id,
        email: employee.email,
        role: employee.role,
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn } as jwt.SignOptions
    );
  }

  private generateRefreshToken(userId: string): string {
    return jwt.sign({ userId, jti: uuidv4() }, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn,
    } as jwt.SignOptions);
  }
}
