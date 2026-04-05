export type Role = "admin" | "school";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  mobileNumber: string;
  role: Role;
  createdAt: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    token: string;
  };
}

export interface MeResponse {
  success: boolean;
  data: AuthUser;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  mobileNumber: string;
}

export interface RegisterResponse {
  success: boolean;
  data: {
    id: string;
    email: string;
    name: string;
    mobileNumber: string;
    isVerified: boolean;
  };
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
  };
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  otp: string;
  password: string;
}

export interface ResendOtpPayload {
  email: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}
