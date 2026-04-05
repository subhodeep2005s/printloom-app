import { useForgotPassword } from "@/app/shared/api/auth.query";
import { router } from "expo-router";
import { useState } from "react";
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

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");

  const {
    mutate: forgotPassword,
    isPending,
    isSuccess,
    isError,
    error,
  } = useForgotPassword();

  const handleSubmit = () => {
    if (!email.trim()) return;

    forgotPassword(
      { email: email.trim() },
      {
        onSuccess: () => {},
      }
    );
  };

  const getErrorMessage = () => {
    if (!isError || !error) return null;
    const err = error as any;
    return err?.response?.data?.message || "Something went wrong";
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
            Forgot Password
          </Text>
        </View>

        <View className="flex-1 px-6 justify-center">
          <View className="mb-10">
            <View className="w-16 h-16 bg-black rounded-2xl items-center justify-center mb-6">
              <Text className="text-yellow-400 text-3xl font-bold">?</Text>
            </View>
            <Text className="text-3xl font-bold text-black">
              Reset Password
            </Text>
            <Text className="text-gray-500 mt-3 text-base">
              Enter your email and we'll send you a reset code
            </Text>
          </View>

          {isSuccess ? (
            <View className="bg-green-50 border border-green-200 rounded-2xl p-6">
              <View className="w-12 h-12 bg-green-100 rounded-full items-center justify-center mb-4">
                <Text className="text-green-600 text-2xl">✓</Text>
              </View>
              <Text className="text-green-800 font-semibold text-lg mb-2">
                Email Sent!
              </Text>
              <Text className="text-green-700 text-sm mb-6">
                If an account exists for this email, a reset link has been sent.
              </Text>
              <Pressable
                className="bg-black rounded-xl py-3 items-center"
                onPress={() => router.replace("/login" as any)}
              >
                <Text className="text-yellow-400 font-semibold">
                  Back to Login
                </Text>
              </Pressable>
            </View>
          ) : (
            <>
              <View className="mb-6">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </Text>
                <TextInput
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-black text-base"
                  placeholder="Enter your email"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              {isError && (
                <View className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
                  <Text className="text-red-600 text-sm">
                    {getErrorMessage()}
                  </Text>
                </View>
              )}

              <Pressable
                className={`rounded-xl py-4 items-center ${
                  isPending || !email.trim() ? "bg-gray-300" : "bg-black"
                }`}
                onPress={handleSubmit}
                disabled={isPending || !email.trim()}
              >
                {isPending ? (
                  <ActivityIndicator color="#FBBF24" />
                ) : (
                  <Text className="text-yellow-400 font-semibold text-base">
                    Send Reset Code
                  </Text>
                )}
              </Pressable>

              <View className="flex-row justify-center mt-8">
                <Text className="text-gray-500 text-sm">
                  Remember your password?{" "}
                </Text>
                <Pressable onPress={() => router.back()}>
                  <Text className="text-black font-semibold text-sm">
                    Sign In
                  </Text>
                </Pressable>
              </View>

              <Pressable
                className="mt-6 py-3 items-center"
                onPress={() => router.push({ pathname: "/reset-password", params: { email } } as any)}
              >
                <Text className="text-yellow-500 font-medium text-sm">
                  Already have a reset code?
                </Text>
              </Pressable>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
