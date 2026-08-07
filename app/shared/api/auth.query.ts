import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as SecureStore from "expo-secure-store";
import {
  deleteMeApi,
  forgotPasswordApi,
  getMeApi,
  loginApi,
  registerApi,
  resetPasswordApi,
  getOrganizationsApi,
  updateOrganizationApi,
  deleteOrganizationApi,
} from "./auth.api";
import {
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
  UpdateOrganizationPayload,
} from "../types/auth/types";
import { clearOrgId } from "@/app/lib/orgStore";

export const useLogin = () => {
  return useMutation({
    mutationFn: (data: LoginPayload) => loginApi(data),
    onSuccess: async (data) => {
      await SecureStore.setItemAsync("access_token", data.data.token);
    },
  });
};

export const useMe = () => {
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await getMeApi();
      return res.data;
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: (data: RegisterPayload) => registerApi(data),
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (data: ForgotPasswordPayload) => forgotPasswordApi(data),
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: (data: ResetPasswordPayload) => resetPasswordApi(data),
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return async () => {
    await SecureStore.deleteItemAsync("access_token");
    await clearOrgId();
    queryClient.clear();
  };
};

export const useDeleteMe = () => {
  return useMutation({
    mutationFn: () => deleteMeApi(),
  });
};

export const useOrganizations = () => {
  return useQuery({
    queryKey: ["organizations"],
    queryFn: async () => {
      const res = await getOrganizationsApi();
      return res.data;
    },
  });
};

export const useUpdateOrganization = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orgId, data }: { orgId: string; data: UpdateOrganizationPayload }) =>
      updateOrganizationApi(orgId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["organizations"] }),
  });
};

export const useDeleteOrganization = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orgId: string) => deleteOrganizationApi(orgId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["organizations"] }),
  });
};
