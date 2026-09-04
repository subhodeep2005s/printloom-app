import { useResetPassword } from "@/shared/api/auth.query";
import { AuthField } from "@/shared/components/auth/AuthField";
import { AuthShell } from "@/shared/components/auth/AuthShell";
import { useToast } from "@/shared/components/Toast";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

export default function ResetPasswordScreen() {
  const params = useLocalSearchParams();
  const initialEmail =
    typeof params.email === "string"
      ? params.email
      : Array.isArray(params.email)
        ? params.email[0]
        : "";

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const emailRef = useRef<TextInput>(null);
  const otpRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  const {
    mutate: resetPassword,
    isPending,
    isSuccess,
    isError,
    error,
  } = useResetPassword();

  const toast = useToast();

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isOtpValid = otp.trim().length >= 4;
  const isPasswordValid = password.trim().length >= 8;
  const doPasswordsMatch = password === confirmPassword;

  const isFormValid =
    isEmailValid &&
    isOtpValid &&
    isPasswordValid &&
    doPasswordsMatch &&
    !isPending;

  const handleSubmit = () => {
    if (!isEmailValid) {
      emailRef.current?.focus();
      return;
    }
    if (!isOtpValid) {
      otpRef.current?.focus();
      return;
    }
    if (!isPasswordValid) {
      passwordRef.current?.focus();
      return;
    }
    if (!doPasswordsMatch) {
      confirmPasswordRef.current?.focus();
      return;
    }

    resetPassword(
      {
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
        password: password.trim(),
      },
      {
        onSuccess: (res) => {
          toast.show({
            type: "success",
            title: "Password Reset Successful!",
            message: res?.message || "You can now sign in with your new password.",
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
      "Failed to reset password. Please verify the code and try again."
    );
  };

  return (
    <AuthShell
      backButton
      eyebrow="Security update"
      title="Choose New Password"
      subtitle="Enter the verification code from your email and create a secure new password."
      footer={
        <View className="flex-row justify-center py-2">
          <Text className="text-gray-500">Back to </Text>
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
        <View className="rounded-2xl border border-green-200 bg-green-50 p-8 shadow-sm">
          <View className="items-center pb-4">
            <Ionicons
              name="checkmark-circle"
              size={56}
              color="#16A34A"
            />
          </View>
          <Text className="text-center text-xl font-bold text-green-800">
            Password Updated!
          </Text>
          <Text className="mt-3 text-center text-base leading-6 text-green-700">
            Your account credentials have been reset successfully. You can now
            sign in to your workspace.
          </Text>

          <Pressable
            className="mt-8 flex-row items-center justify-center rounded-xl bg-gray-900 py-4 active:opacity-80"
            onPress={() => router.replace("/(auth)/login")}
          >
            <Text className="text-base font-bold text-white">
              Sign In Now &rarr;
            </Text>
          </Pressable>
        </View>
      ) : (
        <View className="space-y-4">
          <View className="mb-4">
            <AuthField
              ref={emailRef}
              label="Work Email"
              icon="mail-outline"
              placeholder="name@organization.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
              returnKeyType="next"
              onSubmitEditing={() => {
                setTimeout(() => otpRef.current?.focus(), 100);
              }}
              blurOnSubmit={false}
              editable={!isPending}
            />
          </View>

          <View className="mb-4">
            <AuthField
              ref={otpRef}
              label="Reset Code (from email)"
              icon="key-outline"
              placeholder="Enter 6-digit code"
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={10}
              value={otp}
              onChangeText={setOtp}
              returnKeyType="next"
              onSubmitEditing={() => {
                setTimeout(() => passwordRef.current?.focus(), 100);
              }}
              blurOnSubmit={false}
              editable={!isPending}
            />
          </View>

          <View className="mb-4">
            <AuthField
              ref={passwordRef}
              label="New Password"
              icon="lock-closed-outline"
              placeholder="Min. 8 characters"
              helperText="Must be at least 8 characters long."
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              returnKeyType="next"
              onSubmitEditing={() => {
                setTimeout(() => confirmPasswordRef.current?.focus(), 100);
              }}
              blurOnSubmit={false}
              editable={!isPending}
              secureToggle={{
                visible: showPassword,
                onToggle: () => setShowPassword((v) => !v),
              }}
            />
          </View>

          <View className="mb-2">
            <AuthField
              ref={confirmPasswordRef}
              label="Confirm New Password"
              icon="shield-checkmark-outline"
              placeholder="Re-enter new password"
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              error={
                confirmPassword.length > 0 && !doPasswordsMatch
                  ? "Passwords do not match."
                  : null
              }
              returnKeyType="go"
              onSubmitEditing={handleSubmit}
              editable={!isPending}
              secureToggle={{
                visible: showConfirmPassword,
                onToggle: () => setShowConfirmPassword((v) => !v),
              }}
            />
          </View>

          {isError && (
            <View className="mt-2 flex-row items-center gap-3 rounded-xl bg-red-50 p-4">
              <Ionicons name="alert-circle" size={20} color="#EF4444" />
              <Text className="flex-1 text-sm font-medium text-red-700">
                {getErrorMessage()}
              </Text>
            </View>
          )}

          <Pressable
            className={`mt-4 flex-row items-center justify-center rounded-xl py-4 active:opacity-80 ${
              isPending || !isFormValid ? "bg-gray-200" : "bg-gray-900"
            }`}
            onPress={handleSubmit}
            disabled={isPending || !isFormValid}
          >
            {isPending ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text
                className={`text-base font-bold ${
                  isFormValid ? "text-white" : "text-gray-400"
                }`}
              >
                Reset Password
              </Text>
            )}
          </Pressable>
        </View>
      )}
    </AuthShell>
  );
}
