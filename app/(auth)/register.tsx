import { useRegister } from "@/app/shared/api/auth.query";
import { RegisterPayload } from "@/app/shared/types/auth/types";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RegisterScreen() {
  const [form, setForm] = useState<RegisterPayload>({
    email: "",
    password: "",
    name: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    mobileNumber: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const { mutate, isPending, isError, error, isSuccess } = useRegister();

  const handleChange = (key: keyof RegisterPayload, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleRegister = () => {
    if (!form.email.trim() || !form.password.trim() || !form.name.trim()) {
      return;
    }

    mutate(form, {
      onSuccess: () => {
        router.replace({
          pathname: "/otp",
          params: { email: form.email },
        });
      },
    });
  };

  const getErrorMessage = () => {
    if (!isError || !error) return null;
    const err = error as any;
    return err?.response?.data?.message || "Registration failed";
  };

  const isFormValid =
    form.email.trim() && form.password.trim() && form.name.trim();

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
          <Text className="text-xl font-bold text-black ml-2">Register</Text>
        </View>

        <ScrollView
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="mb-8">
            <Text className="text-3xl font-bold text-black">
              Create Account
            </Text>
            <Text className="text-gray-500 mt-1 text-base">
              Register your school
            </Text>
          </View>

          <View className="space-y-4 pb-8">
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">
                School Name *
              </Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-black text-base"
                placeholder="Enter school name"
                placeholderTextColor="#9CA3AF"
                value={form.name}
                onChangeText={(v) => handleChange("name", v)}
              />
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Email *
              </Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-black text-base"
                placeholder="Enter email address"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={form.email}
                onChangeText={(v) => handleChange("email", v)}
              />
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Password *
              </Text>
              <View className="relative">
                <TextInput
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-black text-base pr-12"
                  placeholder="Create a password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                  value={form.password}
                  onChangeText={(v) => handleChange("password", v)}
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
                Mobile Number
              </Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-black text-base"
                placeholder="Enter mobile number"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                value={form.mobileNumber}
                onChangeText={(v) => handleChange("mobileNumber", v)}
              />
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Address
              </Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-black text-base"
                placeholder="Enter address"
                placeholderTextColor="#9CA3AF"
                value={form.address}
                onChangeText={(v) => handleChange("address", v)}
              />
            </View>

            <View className="flex-row space-x-3">
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  City
                </Text>
                <TextInput
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-black text-base"
                  placeholder="City"
                  placeholderTextColor="#9CA3AF"
                  value={form.city}
                  onChangeText={(v) => handleChange("city", v)}
                />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  State
                </Text>
                <TextInput
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-black text-base"
                  placeholder="State"
                  placeholderTextColor="#9CA3AF"
                  value={form.state}
                  onChangeText={(v) => handleChange("state", v)}
                />
              </View>
            </View>

            <View className="flex-row space-x-3">
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Zip Code
                </Text>
                <TextInput
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-black text-base"
                  placeholder="Zip"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  value={form.zipCode}
                  onChangeText={(v) => handleChange("zipCode", v)}
                />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Country
                </Text>
                <TextInput
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-black text-base"
                  placeholder="Country"
                  placeholderTextColor="#9CA3AF"
                  value={form.country}
                  onChangeText={(v) => handleChange("country", v)}
                />
              </View>
            </View>

            {isError && (
              <View className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <Text className="text-red-600 text-sm">{getErrorMessage()}</Text>
              </View>
            )}

            <Pressable
              className={`rounded-xl py-4 items-center mt-4 ${
                isPending || !isFormValid ? "bg-gray-300" : "bg-black"
              }`}
              onPress={handleRegister}
              disabled={isPending || !isFormValid}
            >
              {isPending ? (
                <ActivityIndicator color="#FBBF24" />
              ) : (
                <Text className="text-yellow-400 font-semibold text-base">
                  Create Account
                </Text>
              )}
            </Pressable>

            <View className="flex-row justify-center mt-4">
              <Text className="text-gray-500 text-sm">
                Already have an account?{" "}
              </Text>
              <Pressable onPress={() => router.back()}>
                <Text className="text-black font-semibold text-sm">Sign In</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
