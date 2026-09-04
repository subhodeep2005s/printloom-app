import { clearOrgId } from "@/lib/orgStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as SecureStore from "expo-secure-store";
import type {
	ForgotPasswordPayload,
	LoginPayload,
	RegisterPayload,
	ResetPasswordPayload,
	UpdateOrganizationPayload,
} from "../types/auth/types";
import {
	deleteAccountApi,
	deleteOrganizationApi,
	forgotPasswordApi,
	getMeApi,
	getOrganizationsApi,
	loginApi,
	registerApi,
	resetPasswordApi,
	updateOrganizationApi,
} from "./auth.api";

export const useLogin = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: LoginPayload) => loginApi(data),
		onSuccess: async (data) => {
			await SecureStore.setItemAsync("access_token", data.data.token);
			await queryClient.invalidateQueries({ queryKey: ["me"] });
		},
	});
};

export const useMe = () => {
	return useQuery({
		queryKey: ["me"],
		queryFn: async () => {
			const token = await SecureStore.getItemAsync("access_token");
			if (!token) {
				return null;
			}
			try {
				const res = await getMeApi();
				return res.data;
			} catch (err: any) {
				if (err?.response?.status === 401) {
					await SecureStore.deleteItemAsync("access_token");
					return null;
				}
				throw err;
			}
		},
		retry: (failureCount, error: any) => {
			if (error?.response?.status === 401) return false;
			return failureCount < 2;
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
		mutationFn: ({
			orgId,
			data,
		}: {
			orgId: string;
			data: UpdateOrganizationPayload;
		}) => updateOrganizationApi(orgId, data),
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: ["organizations"] }),
	});
};

export const useDeleteOrganization = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (orgId: string) => deleteOrganizationApi(orgId),
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: ["organizations"] }),
	});
};

export const useDeleteAccount = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: () => deleteAccountApi(),
		onSuccess: async () => {
			await SecureStore.deleteItemAsync("access_token");
			await clearOrgId();
			queryClient.clear();
		},
	});
};
