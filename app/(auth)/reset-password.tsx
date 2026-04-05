import { useResetPassword } from "@/app/shared/api/auth.query";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ResetPasswordScreen() {
  const params = useLocalSearchParams();
  const email =
    typeof params.email === "string"
      ? params.email
      : params.email?.[0] ?? "";

  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const {
    mutate: resetPassword,
    isPending,
    isSuccess,
    isError,
    error,
  } = useResetPassword();

  const passwordsMatch = password === confirmPassword;
  const isFormValid =
    email.trim() &&
    otp.trim().length >= 4 &&
    password.trim().length >= 6 &&
    passwordsMatch;

  const handleSubmit = () => {
    if (!isFormValid) return;

    resetPassword(
      {
        email,
        otp: otp.trim(),
        password: password.trim(),
      },
      {
        onSuccess: () => {},
      }
    );
  };

  const getErrorMessage = () => {
    if (!isError || !error) return null;
    const err = error as any;
    return err?.response?.data?.message || "Reset failed";
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-row items-center px-6 py-4 border-b border-gray-100">
          <Pressable
            className="w-10 h-10 items-center justify-center"
            onPress={() => router.back()}
          >
            <Text className="text-2xl text-black">←</Text>
          </Pressable>
          <Text className="text-xl font-bold text-black ml-2">
            Reset Password
          </Text>
        </View>

        <View className="flex-1 px-6 justify-center">
          {isSuccess ? (
            <View className="bg-green-50 border border-green-200 rounded-2xl p-6">
              <View className="w-16 h-16 bg-green-100 rounded-full items-center justify-center mb-4 mx-auto">
                <Text className="text-green-600 text-3xl">✓</Text>
              </View>
              <Text className="text-green-800 font-semibold text-xl text-center mb-2">
                Password Reset!
              </Text>
              <Text className="text-green-700 text-sm text-center mb-6">
                Your password has been successfully reset.
              </Text>
              <Pressable
                className="bg-black rounded-xl py-3 items-center"
                onPress={() => router.replace("/login" as any)}
              >
                <Text className="text-yellow-400 font-semibold">
                  Sign In
                </Text>
              </Pressable>
            </View>
          ) : (
            <>
              <View className="mb-10">
                <View className="w-16 h-16 bg-yellow-400 rounded-2xl items-center justify-center mb-6">
                  <Text className="text-black text-3xl font-bold">🔑</Text>
                </View>
                <Text className="text-3xl font-bold text-black">
                  New Password
                </Text>
                <Text className="text-gray-500 mt-3 text-base">
                  Enter the reset code and your new password
                </Text>
              </View>

              <View className="space-y-4">
                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Reset Code
                  </Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-black text-base"
                    placeholder="Enter reset code"
                    placeholderTextColor="#9CA3AF"
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={otp}
                    onChangeText={setOtp}
                  />
                </View>

                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </Text>
                  <View className="relative">
                    <TextInput
                      className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-black text-base pr-12"
                      placeholder="Min. 6 characters"
                      placeholderTextColor="#9CA3AF"
                      secureTextEntry={!showPassword}
                      value={password}
                      onChangeText={setPassword}
                    />
                    <Pressable
                      className="absolute right-4 top-1/2 -translate-y-1/2"
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Text className="text-gray-500 text-sm">
                        {showPassword ? "Hide" : "Show"}
                      </Text>
                    </Pressable>
                  </View>
                </View>

                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </Text>
                  <TextInput
                    className={`bg-gray-50 border rounded-xl px-4 py-4 text-black text-base ${
                      confirmPassword && !passwordsMatch
                        ? "border-red-500"
                        : "border-gray-200"
                    }`}
                    placeholder="Confirm new password"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showPassword}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                  />
                  {confirmPassword && !passwordsMatch && (
                    <Text className="text-red-500 text-xs mt-1">
                      Passwords don't match
                    </Text>
                  )}
                </View>

                {isError && (
                  <View className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                    <Text className="text-red-600 text-sm">
                      {getErrorMessage()}
                    </Text>
                  </View>
                )}

                <Pressable
                  className={`rounded-xl py-4 items-center mt-4 ${
                    isPending || !isFormValid ? "bg-gray-300" : "bg-black"
                  }`}
                  onPress={handleSubmit}
                  disabled={isPending || !isFormValid}
                >
                  {isPending ? (
                    <ActivityIndicator color="#FBBF24" />
                  ) : (
                    <Text className="text-yellow-400 font-semibold text-base">
                      Reset Password
                    </Text>
                  )}
                </Pressable>
              </View>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function useLocalSearchParams() {
  const { useLocalSearchParams } = require("expo-router");
  return useLocalSearchParams();
}
