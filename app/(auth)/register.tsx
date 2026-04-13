import { useRegister } from "@/app/shared/api/auth.query";
import { RegisterPayload, OrganizationType } from "@/app/shared/types/auth/types";
import { useToast } from "@/app/shared/components/Toast";
import { router } from "expo-router";
import { useState, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ORGANIZATION_TYPES: { label: string; value: OrganizationType }[] = [
  { label: "Organization", value: "organization" },
  { label: "College", value: "college" },
  { label: "University", value: "university" },
  { label: "Coaching", value: "coaching" },
  { label: "Company", value: "company" },
  { label: "NGO", value: "ngo" },
  { label: "Government", value: "government" },
  { label: "Other", value: "other" },
];

export default function RegisterScreen() {
  const [form, setForm] = useState<RegisterPayload>({
    email: "",
    password: "",
    name: "",
    organizationType: "organization",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const { mutate, isPending, isError, error } = useRegister();
  const toast = useToast();

  const handleChange = (key: keyof RegisterPayload, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const openDropdown = () => {
    setShowDropdown(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const closeDropdown = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => setShowDropdown(false));
  };

  const selectType = (value: OrganizationType) => {
    handleChange("organizationType", value);
    closeDropdown();
  };

  const getSelectedLabel = () => {
    return (
      ORGANIZATION_TYPES.find((t) => t.value === form.organizationType)
        ?.label || "Select type"
    );
  };

  const handleRegister = () => {
    if (!form.email.trim() || !form.password.trim() || !form.name.trim()) {
      return;
    }

    mutate(form, {
      onSuccess: () => {
        toast.show({
          type: "success",
          title: "Account Created!",
          message: "Please verify your email with OTP",
        });
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
              Register your organization
            </Text>
          </View>

          <View className="space-y-4 pb-8">
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Organization Name *
              </Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-black text-base"
                placeholder="Enter organization name"
                placeholderTextColor="#9CA3AF"
                value={form.name}
                onChangeText={(v) => handleChange("name", v)}
              />
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Organization Type *
              </Text>
              <Pressable
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 flex-row items-center justify-between"
                onPress={openDropdown}
              >
                <Text className="text-black text-base">
                  {getSelectedLabel()}
                </Text>
                <Text className="text-gray-400 text-sm">▼</Text>
              </Pressable>
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

      {/* Organization Type Dropdown Modal */}
      <Modal
        visible={showDropdown}
        transparent
        animationType="none"
        onRequestClose={closeDropdown}
      >
        <Pressable
          className="flex-1 bg-black/40 justify-end"
          onPress={closeDropdown}
        >
          <Animated.View
            style={{ opacity: fadeAnim }}
            className="bg-white rounded-t-3xl pb-8"
          >
            <View className="items-center pt-3 pb-2">
              <View className="w-10 h-1 bg-gray-300 rounded-full" />
            </View>
            <Text className="text-lg font-bold text-black px-6 py-3">
              Select Organization Type
            </Text>
            <ScrollView className="max-h-96">
              {ORGANIZATION_TYPES.map((type) => {
                const isSelected = form.organizationType === type.value;
                return (
                  <Pressable
                    key={type.value}
                    className={`flex-row items-center justify-between px-6 py-4 ${
                      isSelected ? "bg-yellow-50" : ""
                    }`}
                    onPress={() => selectType(type.value)}
                  >
                    <Text
                      className={`text-base ${
                        isSelected
                          ? "text-black font-semibold"
                          : "text-gray-700"
                      }`}
                    >
                      {type.label}
                    </Text>
                    {isSelected && (
                      <Text className="text-yellow-500 text-lg">✓</Text>
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Animated.View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
