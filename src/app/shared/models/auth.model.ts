export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface UserDTO {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

