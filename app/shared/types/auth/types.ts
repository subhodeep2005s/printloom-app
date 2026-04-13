export type Role = "admin" | "org";

export type OrganizationType =
  | "organization"
  | "college"
  | "university"
  | "coaching"
  | "company"
  | "ngo"
  | "government"
  | "other";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  organizationType: OrganizationType | null;
  mobileNumber: string | null;
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
  organizationType: OrganizationType;
}

export interface RegisterResponse {
  success: boolean;
  data: {
    id: string;
    email: string;
    name: string;
    organizationType: OrganizationType;
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

export interface OrganizationDto {
  id: string;
  email: string;
  name: string;
  organization_type: string;
  created_at: string;
  is_active: boolean;
}

export interface UpdateOrganizationPayload {
  email?: string;
  name?: string;
  organizationType?: string;
  isActive?: boolean;
}
