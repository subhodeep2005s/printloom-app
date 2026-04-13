import axiosInstance from "@/app/lib/axiosInstance";
import {
  ApiResponse,
  ForgotPasswordPayload,
  LoginPayload,
  LoginResponse,
  MeResponse,
  RegisterPayload,
  RegisterResponse,
  ResetPasswordPayload,
  ResendOtpPayload,
  VerifyOtpPayload,
  VerifyOtpResponse,
  OrganizationDto,
  UpdateOrganizationPayload,
} from "../types/auth/types";

export const loginApi = async (data: LoginPayload) => {
  const res = await axiosInstance.post<LoginResponse>("/auth/login", data);
  return res.data;
};

export const getMeApi = async () => {
  const res = await axiosInstance.get<MeResponse>("/auth/me");
  return res.data;
};

export const registerApi = async (data: RegisterPayload) => {
  const res = await axiosInstance.post<RegisterResponse>(
    "/auth/register",
    data
  );
  return res.data;
};

export const verifyOtpApi = async (data: VerifyOtpPayload) => {
  if (__DEV__) {
    console.log("📤 [verifyOtp] Request payload:", {
      email: data.email,
      otp: data.otp,
      otpLength: data.otp?.length,
    });
  }
  const res = await axiosInstance.post<VerifyOtpResponse>(
    "/auth/verify-otp",
    data
  );
  return res.data;
};

export const forgotPasswordApi = async (data: ForgotPasswordPayload) => {
  const res = await axiosInstance.post<ApiResponse>(
    "/auth/school/forgot-password",
    data
  );
  return res.data;
};

export const resetPasswordApi = async (data: ResetPasswordPayload) => {
  const res = await axiosInstance.post<ApiResponse>(
    "/auth/school/reset-password",
    data
  );
  return res.data;
};

export const resendOtpApi = async (data: ResendOtpPayload) => {
  const res = await axiosInstance.post<ApiResponse>("/auth/resend-otp", data);
  return res.data;
};

export const getOrganizationsApi = async () => {
  const res = await axiosInstance.get<ApiResponse<OrganizationDto[]>>("/auth/organizations");
  return res.data;
};

export const updateOrganizationApi = async (orgId: string, data: UpdateOrganizationPayload) => {
  const res = await axiosInstance.patch<ApiResponse<OrganizationDto>>(`/auth/organizations/${orgId}`, data);
  return res.data;
};

export const deleteOrganizationApi = async (orgId: string) => {
  const res = await axiosInstance.delete<ApiResponse<OrganizationDto>>(`/auth/organizations/${orgId}`);
  return res.data;
};
