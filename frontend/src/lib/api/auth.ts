import { apiClient } from '@/lib/api/client';
import type { ApiResponse, AuthResponse, LoginRequest, RegisterRequest } from '@/types/api';

export async function login(request: LoginRequest): Promise<AuthResponse> {
  const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', request);
  return response.data.data;
}

export async function register(request: RegisterRequest): Promise<AuthResponse> {
  const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', request);
  return response.data.data;
}
