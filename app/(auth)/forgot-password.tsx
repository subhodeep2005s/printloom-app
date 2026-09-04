import { useForgotPassword } from "@/shared/api/auth.query";
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

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const emailRef = useRef<TextInput>(null);

  const {
    mutate: forgotPassword,
    isPending,
    isSuccess,
    isError,
    error,
  } = useForgotPassword();

  const toast = useToast();

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const handleSubmit = () => {
    if (!isEmailValid || isPending) return;

    forgotPassword(
      { email: email.trim().toLowerCase() },
      {
        onSuccess: (res) => {
          toast.show({
            type: "success",
            title: "Reset Code Sent",
            message:
              res?.message ||
              "Check your email for the password reset verification code.",
          });
        },
        onError: () => {
          toast.show({
            type: "info",
            title: "Check your email",
            message: "If an account exists, a reset code has been dispatched.",
          });
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
      "Unable to send reset code. Please try again."
    );
  };

  return (
    <AuthShell
      backButton
      eyebrow="Account recovery"
      title="Reset Password"
      subtitle="Enter your organization email address and we’ll send you a 6-digit verification code."
      footer={
        <View className="flex-row justify-center py-2">
          <Text className="text-gray-500">Remember your password? </Text>
          <Pressable
            hitSlop={10}
            onPress={() => router.replace("/(auth)/login")}
          >
            <Text className="font-bold text-gray-900">Sign In</Text>
          </Pressable>
        </View>
      }
    >
      {isSuccess ? (
        <View className="rounded-2xl border border-green-200 bg-green-50 p-6 shadow-sm">
          <View className="mb-4 flex-row items-center gap-3">
            <Ionicons
              name="checkmark-circle"
              size={28}
              color="#16A34A"
            />
            <Text className="text-lg font-bold text-green-700">
              Code Dispatched
            </Text>
          </View>

          <Text className="text-base leading-6 text-green-800">
            We've sent a verification code to{" "}
            <Text className="font-bold text-green-900">{email}</Text>. Please
            check your inbox and spam folders.
          </Text>

          <Pressable
            className="mt-6 flex-row items-center justify-center rounded-xl bg-gray-900 py-4 active:opacity-80"
            onPress={() =>
              router.push({
                pathname: "/(auth)/reset-password",
                params: { email: email.trim() },
              })
            }
          >
            <Text className="text-base font-bold text-white">
              Enter Reset Code &rarr;
            </Text>
          </Pressable>
        </View>
      ) : (
        <View className="space-y-4">
          <View className="mb-2">
            <AuthField
              ref={emailRef}
              label="Work Email Address"
              icon="mail-outline"
              placeholder="name@organization.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
              returnKeyType="go"
              onSubmitEditing={handleSubmit}
              editable={!isPending}
            />
          </View>

          {isError && (
            <View className="flex-row items-center gap-3 rounded-xl bg-red-50 p-4">
              <Ionicons name="alert-circle" size={20} color="#EF4444" />
              <Text className="flex-1 text-sm font-medium text-red-700">
                {getErrorMessage()}
              </Text>
            </View>
          )}

          <Pressable
            className={`mt-4 flex-row items-center justify-center rounded-xl py-4 active:opacity-80 ${
              isPending || !isEmailValid ? "bg-gray-200" : "bg-gray-900"
            }`}
            onPress={handleSubmit}
            disabled={isPending || !isEmailValid}
          >
            {isPending ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text
                className={`text-base font-bold ${
                  isEmailValid ? "text-white" : "text-gray-400"
                }`}
              >
                Send Reset Code
              </Text>
            )}
          </Pressable>

          <Pressable
            className="mt-4 items-center py-2"
            onPress={() =>
              router.push({
                pathname: "/(auth)/reset-password",
                params: { email: email.trim() },
              })
            }
          >
            <Text className="text-sm font-semibold text-blue-600">
              Already have a code? Reset Password
            </Text>
          </Pressable>
        </View>
      )}
    </AuthShell>
  );
}
