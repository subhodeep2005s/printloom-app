import { useLogin } from "@/app/shared/api/auth.query";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { mutate, isPending, isError, error } = useLogin();

  const handleLogin = () => {
    if (!email.trim() || !password.trim()) return;

    mutate(
      { email: email.trim(), password },
      {
        onSuccess: () => {
          router.replace("/");
        },
      },
    );
  };

  const getErrorMessage = () => {
    if (!isError || !error) return null;
    const err = error as any;
    return err?.response?.data?.message || "Invalid credentials";
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 px-6 justify-center">
          {/* 🔰 LOGO + BRAND */}
          <View className="items-center mb-12">
            <Image
              source={require("../../assets/images/icon.png")}
              className="w-32 h-32"
              resizeMode="contain"
            />

            <Text className="text-3xl font-bold text-black mt-4">
              PrintLoom
            </Text>

            <Text className="text-gray-500 text-sm mt-1 text-center px-6">
              Smart ID Card Printing for Schools & Businesses
            </Text>
          </View>

          {/* 🔐 FORM */}
          <View className="space-y-4">
            {/* Email */}
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Email
              </Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 text-black"
                placeholder="Enter your email"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            {/* Password */}
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Password
              </Text>
              <View className="relative">
                <TextInput
                  className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 text-black pr-12"
                  placeholder="Enter your password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <Pressable
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Text className="text-yellow-500 font-medium text-sm">
                    {showPassword ? "Hide" : "Show"}
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Forgot */}
            <Pressable
              className="items-end mb-4"
              onPress={() => router.push("/forgot-password" as any)}
            >
              <Text className="text-yellow-500 font-medium text-sm">
                Forgot Password?
              </Text>
            </Pressable>

            {/* Error */}
            {isError && (
              <View className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <Text className="text-red-600 text-sm">
                  {getErrorMessage()}
                </Text>
              </View>
            )}

            {/* Button */}
            <Pressable
              className={`rounded-2xl py-4 items-center mt-2 ${
                isPending || !email.trim() || !password.trim()
                  ? "bg-gray-300"
                  : "bg-black"
              }`}
              onPress={handleLogin}
              disabled={isPending || !email.trim() || !password.trim()}
            >
              {isPending ? (
                <ActivityIndicator color="#FACC15" />
              ) : (
                <Text className="text-yellow-400 font-semibold text-base">
                  Sign In
                </Text>
              )}
            </Pressable>
          </View>

          {/* Register */}
          <View className="flex-row justify-center mt-10">
            <Text className="text-gray-500 text-sm">
              Don't have an account?{" "}
            </Text>
            <Pressable onPress={() => router.push("/register" as any)}>
              <Text className="text-black font-semibold text-sm">Register</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
