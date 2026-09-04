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
  name: string | null;
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
  name?: string | null;
  organizationType?: OrganizationType | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  mobileNumber?: string | null;
}

export interface RegisterResponse {
  success: boolean;
  data: {
    id: string;
    email: string;
    name: string | null;
    organizationType: OrganizationType | null;
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

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface OrganizationDto {
  id: string;
  email: string;
  name: string | null;
  organization_type: string | null;
  created_at: string;
  is_active: boolean;
}

export interface UpdateOrganizationPayload {
  email?: string;
  name?: string;
  organizationType?: string;
  isActive?: boolean;
}
