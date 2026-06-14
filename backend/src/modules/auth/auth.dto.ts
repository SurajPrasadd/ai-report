export interface LoginDto {
  employeeId: string;
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterDto {
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'Admin' | 'PM' | 'Developer' | 'QA' | 'BA' | 'Architect';
  department?: string;
  designation?: string;
  phone?: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  newPassword: string;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  user: {
    id: string;
    employeeId: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    department?: string;
    designation?: string;
    avatarUrl?: string;
  };
}
