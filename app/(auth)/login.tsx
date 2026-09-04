import { useLogin } from "@/shared/api/auth.query";
import { AuthField } from "@/shared/components/auth/AuthField";
import { AuthShell } from "@/shared/components/auth/AuthShell";
import { useToast } from "@/shared/components/Toast";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const { mutate, isPending, isError, error } = useLogin();
  const toast = useToast();

  const isFormFilled = email.trim().length > 0 && password.trim().length > 0;

  const handleLogin = () => {
    if (!isFormFilled || isPending) return;

    mutate(
      { email: email.trim(), password },
      {
        onSuccess: () => {
          toast.show({
            type: "success",
            title: "Welcome back!",
            message: "Logged in successfully",
          });
          router.replace("/");
        },
      },
    );
  };

  const getErrorMessage = () => {
    if (!isError || !error) return null;
    const err = error as any;
    return (
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message ||
      "Invalid email or password. Please try again."
    );
  };

  return (
    <AuthShell
      eyebrow="Secure access"
      title="Sign In"
      subtitle="Enter your email and password to access your workspace."
      footer={
        <View className="flex-row justify-center py-2">
          <Text className="text-gray-500">Don't have an account? </Text>
          <Pressable
            hitSlop={10}
            onPress={() => router.push("/(auth)/register")}
          >
            <Text className="font-bold text-gray-900">Register</Text>
          </Pressable>
        </View>
      }
    >
      <View className="space-y-5">
        <View className="mb-4">
          <AuthField
            ref={emailRef}
            label="Email Address"
            icon="mail-outline"
            placeholder="name@organization.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
            returnKeyType="next"
            onSubmitEditing={() => {
              setTimeout(() => {
                passwordRef.current?.focus();
              }, 100);
            }}
            blurOnSubmit={false}
            editable={!isPending}
          />
        </View>

        <View className="mb-6">
          <View className="mb-1.5 flex-row items-center justify-between">
            <Text className="ml-1 text-sm font-medium text-gray-700">Password</Text>
            <Pressable
              hitSlop={10}
              onPress={() => router.push("/(auth)/forgot-password")}
            >
              <Text className="text-xs font-semibold text-blue-600">
                Forgot password?
              </Text>
            </Pressable>
          </View>
          <AuthField
            ref={passwordRef}
            icon="lock-closed-outline"
            placeholder="Enter your password"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            returnKeyType="go"
            onSubmitEditing={handleLogin}
            editable={!isPending}
            secureToggle={{
              visible: showPassword,
              onToggle: () => setShowPassword((v) => !v),
            }}
          />
        </View>

        {isError && (
          <View className="mb-4 flex-row items-center gap-3 rounded-xl bg-red-50 p-4">
            <Ionicons name="alert-circle" size={20} color="#EF4444" />
            <Text className="flex-1 text-sm font-medium text-red-700">
              {getErrorMessage()}
            </Text>
          </View>
        )}

        <Pressable
          className={`mt-4 flex-row items-center justify-center rounded-xl py-4 active:opacity-80 ${
            isPending || !isFormFilled ? "bg-gray-200" : "bg-gray-900"
          }`}
          onPress={handleLogin}
          disabled={isPending || !isFormFilled}
        >
          {isPending ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text
              className={`text-base font-bold ${
                isFormFilled ? "text-white" : "text-gray-400"
              }`}
            >
              Sign In
            </Text>
          )}
        </Pressable>
      </View>
    </AuthShell>
  );
}
