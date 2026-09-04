import { loginApi, registerApi } from "@/shared/api/auth.api";
import { AuthField } from "@/shared/components/auth/AuthField";
import { AuthShell } from "@/shared/components/auth/AuthShell";
import { useToast } from "@/shared/components/Toast";
import type {
  OrganizationType,
  RegisterPayload,
} from "@/shared/types/auth/types";
import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

const ORGANIZATION_TYPES: {
  label: string;
  value: OrganizationType;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { label: "Organization", value: "organization", icon: "business-outline" },
  { label: "College", value: "college", icon: "school-outline" },
  { label: "University", value: "university", icon: "ribbon-outline" },
  { label: "Coaching Center", value: "coaching", icon: "book-outline" },
  { label: "Company / Corporate", value: "company", icon: "briefcase-outline" },
  { label: "NGO", value: "ngo", icon: "heart-outline" },
  { label: "Government", value: "government", icon: "shield-outline" },
  { label: "Other", value: "other", icon: "cube-outline" },
];

export default function RegisterScreen() {
  const [form, setForm] = useState<RegisterPayload>({
    name: "",
    organizationType: "organization",
    email: "",
    password: "",
    mobileNumber: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showOptionalFields, setShowOptionalFields] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const nameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const mobileRef = useRef<TextInput>(null);
  const addressRef = useRef<TextInput>(null);
  const cityRef = useRef<TextInput>(null);
  const stateRef = useRef<TextInput>(null);
  const zipCodeRef = useRef<TextInput>(null);

  const toast = useToast();
  const queryClient = useQueryClient();

  const handleChange = (key: keyof RegisterPayload, value: string) => {
    setErrorMessage(null);
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const isPasswordValid = form.password.trim().length >= 8;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
  const isFormValid =
    form.name?.trim() && isEmailValid && isPasswordValid && !loading;

  const handleRegister = async () => {
    if (!form.name?.trim()) {
      setErrorMessage("Please enter an organization name.");
      nameRef.current?.focus();
      return;
    }

    if (!isEmailValid) {
      setErrorMessage("Please enter a valid email address.");
      emailRef.current?.focus();
      return;
    }

    if (!isPasswordValid) {
      setErrorMessage("Password must be at least 8 characters long.");
      passwordRef.current?.focus();
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    const payload: RegisterPayload = {
      name: form.name.trim() || null,
      organizationType: form.organizationType || "organization",
      email: form.email.trim().toLowerCase(),
      password: form.password,
      address: form.address?.trim() || null,
      city: form.city?.trim() || null,
      state: form.state?.trim() || null,
      zipCode: form.zipCode?.trim() || null,
      mobileNumber: form.mobileNumber?.trim() || null,
    };

    try {
      await registerApi(payload);

      try {
        const loginRes = await loginApi({
          email: payload.email,
          password: payload.password,
        });

        const token = loginRes?.data?.token;
        if (token) {
          await SecureStore.setItemAsync("access_token", token);
          await queryClient.invalidateQueries({ queryKey: ["me"] });
          toast.show({
            type: "success",
            title: "Welcome to PrintLoom!",
            message: "Account created and logged in successfully.",
          });
          router.replace("/");
          return;
        }
      } catch (loginErr) {
        if (__DEV__) console.warn("Auto-login fallback:", loginErr);
      }

      toast.show({
        type: "success",
        title: "Account Created!",
        message: "Please sign in with your new credentials.",
      });
      router.replace("/(auth)/login");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Registration failed. Please check your details.";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const getSelectedType = () => {
    return (
      ORGANIZATION_TYPES.find((t) => t.value === form.organizationType) ||
      ORGANIZATION_TYPES[0]
    );
  };

  return (
    <AuthShell
      backButton
      eyebrow="Organization setup"
      title="Create Account"
      subtitle="Register your workspace to start managing datasets and ID card printing."
      footer={
        <View className="flex-row justify-center py-2">
          <Text className="text-gray-500">Already have an account? </Text>
          <Pressable
            hitSlop={10}
            onPress={() => router.replace("/(auth)/login")}
          >
            <Text className="font-bold text-gray-900">Sign In</Text>
          </Pressable>
        </View>
      }
    >
      <View className="space-y-4">
        <View className="mb-4">
          <AuthField
            ref={nameRef}
            label="Organization Name"
            icon="business-outline"
            placeholder="e.g. Apex High School or Tech Corp"
            value={form.name ?? ""}
            onChangeText={(v) => handleChange("name", v)}
            returnKeyType="next"
            onSubmitEditing={() => {
              setTimeout(() => emailRef.current?.focus(), 100);
            }}
            blurOnSubmit={false}
            editable={!loading}
          />
        </View>

        <View className="mb-4">
          <Text className="mb-1.5 ml-1 text-sm font-medium text-gray-700">
            Organization Type
          </Text>
          <Pressable
            className="flex-row items-center justify-between rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3.5 active:bg-gray-100"
            onPress={() => setShowTypeModal(true)}
            disabled={loading}
          >
            <View className="flex-row items-center gap-3">
              <Ionicons
                name={getSelectedType().icon}
                size={20}
                color="#4B5563"
              />
              <Text className="text-base text-gray-900">
                {getSelectedType().label}
              </Text>
            </View>
            <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
          </Pressable>
        </View>

        <View className="mb-4">
          <AuthField
            ref={emailRef}
            label="Work Email"
            icon="mail-outline"
            placeholder="name@organization.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={form.email}
            onChangeText={(v) => handleChange("email", v)}
            returnKeyType="next"
            onSubmitEditing={() => {
              setTimeout(() => passwordRef.current?.focus(), 100);
            }}
            blurOnSubmit={false}
            editable={!loading}
          />
        </View>

        <View className="mb-4">
          <AuthField
            ref={passwordRef}
            label="Password"
            icon="lock-closed-outline"
            placeholder="Create a strong password"
            helperText="Must be at least 8 characters long."
            secureTextEntry={!showPassword}
            value={form.password}
            onChangeText={(v) => handleChange("password", v)}
            returnKeyType={showOptionalFields ? "next" : "go"}
            onSubmitEditing={() => {
              if (showOptionalFields) {
                setTimeout(() => mobileRef.current?.focus(), 100);
              } else {
                handleRegister();
              }
            }}
            editable={!loading}
            secureToggle={{
              visible: showPassword,
              onToggle: () => setShowPassword((v) => !v),
            }}
          />
        </View>

        <View className="mb-2 mt-4 rounded-xl border border-gray-200 bg-white shadow-sm">
          <Pressable
            className="flex-row items-center justify-between px-4 py-4"
            onPress={() => setShowOptionalFields((prev) => !prev)}
          >
            <View className="flex-row items-center gap-2">
              <Ionicons name="location-outline" size={20} color="#4B5563" />
              <Text className="text-sm font-semibold text-gray-700">
                Contact & Location (Optional)
              </Text>
            </View>
            <Ionicons
              name={showOptionalFields ? "chevron-up" : "chevron-down"}
              size={20}
              color="#9CA3AF"
            />
          </Pressable>

          {showOptionalFields && (
            <View className="space-y-4 border-t border-gray-100 p-4 pt-5">
              <View className="mb-4">
                <AuthField
                  ref={mobileRef}
                  label="Mobile Number"
                  icon="call-outline"
                  placeholder="+91 98765 43210"
                  keyboardType="phone-pad"
                  value={form.mobileNumber ?? ""}
                  onChangeText={(v) => handleChange("mobileNumber", v)}
                  returnKeyType="next"
                  onSubmitEditing={() => {
                    setTimeout(() => addressRef.current?.focus(), 100);
                  }}
                  blurOnSubmit={false}
                  editable={!loading}
                />
              </View>

              <View className="mb-4">
                <AuthField
                  ref={addressRef}
                  label="Address"
                  icon="navigate-outline"
                  placeholder="Street address or campus"
                  value={form.address ?? ""}
                  onChangeText={(v) => handleChange("address", v)}
                  returnKeyType="next"
                  onSubmitEditing={() => {
                    setTimeout(() => cityRef.current?.focus(), 100);
                  }}
                  blurOnSubmit={false}
                  editable={!loading}
                />
              </View>

              <View className="mb-4 flex-row gap-3">
                <View className="flex-1">
                  <AuthField
                    ref={cityRef}
                    label="City"
                    placeholder="City"
                    value={form.city ?? ""}
                    onChangeText={(v) => handleChange("city", v)}
                    returnKeyType="next"
                    onSubmitEditing={() => {
                      setTimeout(() => stateRef.current?.focus(), 100);
                    }}
                    blurOnSubmit={false}
                    editable={!loading}
                  />
                </View>
                <View className="flex-1">
                  <AuthField
                    ref={stateRef}
                    label="State"
                    placeholder="State"
                    value={form.state ?? ""}
                    onChangeText={(v) => handleChange("state", v)}
                    returnKeyType="next"
                    onSubmitEditing={() => {
                      setTimeout(() => zipCodeRef.current?.focus(), 100);
                    }}
                    blurOnSubmit={false}
                    editable={!loading}
                  />
                </View>
              </View>

              <View className="mb-2">
                <AuthField
                  ref={zipCodeRef}
                  label="Zip / Postal Code"
                  icon="pin-outline"
                  placeholder="e.g. 700001"
                  keyboardType="number-pad"
                  value={form.zipCode ?? ""}
                  onChangeText={(v) => handleChange("zipCode", v)}
                  returnKeyType="go"
                  onSubmitEditing={handleRegister}
                  editable={!loading}
                />
              </View>
            </View>
          )}
        </View>

        {errorMessage && (
          <View className="mt-4 flex-row items-center gap-3 rounded-xl bg-red-50 p-4">
            <Ionicons name="alert-circle" size={20} color="#EF4444" />
            <Text className="flex-1 text-sm font-medium text-red-700">
              {errorMessage}
            </Text>
          </View>
        )}

        <Pressable
          className={`mt-6 flex-row items-center justify-center rounded-xl py-4 active:opacity-80 ${
            loading || !isFormValid ? "bg-gray-200" : "bg-gray-900"
          }`}
          onPress={handleRegister}
          disabled={loading || !isFormValid}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text
              className={`text-base font-bold ${
                isFormValid ? "text-white" : "text-gray-400"
              }`}
            >
              Create Account
            </Text>
          )}
        </Pressable>
      </View>

      <Modal
        visible={showTypeModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTypeModal(false)}
      >
        <Pressable
          className="flex-1 justify-end bg-black/40"
          onPress={() => setShowTypeModal(false)}
        >
          <Pressable
            className="rounded-t-3xl bg-white pb-8 pt-3 shadow-2xl"
            onPress={(e) => e.stopPropagation()}
          >
            <View className="items-center pb-4">
              <View className="h-1 w-12 rounded-full bg-gray-300" />
            </View>

            <View className="flex-row items-center justify-between border-b border-gray-100 px-6 pb-4">
              <Text className="text-lg font-bold text-gray-900">
                Organization Type
              </Text>
              <Pressable
                hitSlop={15}
                onPress={() => setShowTypeModal(false)}
                className="rounded-full bg-gray-100 p-1.5"
              >
                <Ionicons name="close" size={20} color="#4B5563" />
              </Pressable>
            </View>

            <ScrollView className="max-h-96 px-4 pt-4">
              {ORGANIZATION_TYPES.map((item) => {
                const isSelected = form.organizationType === item.value;
                return (
                  <Pressable
                    key={item.value}
                    className={`mb-3 flex-row items-center justify-between rounded-xl px-4 py-4 active:bg-gray-50 ${
                      isSelected ? "border-2 border-gray-900 bg-gray-50" : "border border-gray-200 bg-white"
                    }`}
                    onPress={() => {
                      handleChange("organizationType", item.value);
                      setShowTypeModal(false);
                    }}
                  >
                    <View className="flex-row items-center gap-3">
                      <Ionicons
                        name={item.icon}
                        size={22}
                        color={isSelected ? "#111827" : "#6B7280"}
                      />
                      <Text
                        className={`text-base ${
                          isSelected ? "font-bold text-gray-900" : "font-medium text-gray-600"
                        }`}
                      >
                        {item.label}
                      </Text>
                    </View>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={24} color="#111827" />
                    )}
                  </Pressable>
                );
              })}
              <View className="h-4" />
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </AuthShell>
  );
}
