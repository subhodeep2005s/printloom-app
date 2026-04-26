import { useRegister } from "@/app/shared/api/auth.query";
import { AuthField } from "@/app/shared/components/auth/AuthField";
import { AuthShell } from "@/app/shared/components/auth/AuthShell";
import { RegisterPayload, OrganizationType } from "@/app/shared/types/auth/types";
import { useToast } from "@/app/shared/components/Toast";
import { colors } from "@/app/shared/constants/theme";
import { router } from "expo-router";
import { useState, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

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
          message: "Please log in with your new account.",
        });
        router.replace("/(auth)/login");
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
    <AuthShell
      backButton
      eyebrow="Organization setup"
      title="Create your account"
      subtitle="Set up your workspace for schools, colleges, companies, and other organizations."
      heroImage={require("../../assets/images/register.png")}
      footer={(
        <View className="flex-row items-center justify-center">
          <Text className="text-sm" style={{ color: colors.inkSoft }}>
            Already have an account?{" "}
          </Text>
          <Pressable onPress={() => router.back()}>
            <Text className="text-sm font-semibold" style={{ color: colors.ink }}>
              Sign In
            </Text>
          </Pressable>
        </View>
      )}
    >
      <View className="gap-4">
        <AuthField
          label="Organization Name"
          icon="business-outline"
          placeholder="Enter organization name"
          value={form.name}
          onChangeText={(v) => handleChange("name", v)}
        />

        <View>
          <Text className="mb-2 text-sm font-semibold" style={{ color: colors.ink }}>
            Organization Type
          </Text>
          <Pressable
            className="flex-row items-center justify-between rounded-[22px] px-4 py-4"
            style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
            onPress={openDropdown}
          >
            <Text className="text-[15px]" style={{ color: colors.ink }}>
              {getSelectedLabel()}
            </Text>
            <Text className="text-sm" style={{ color: colors.goldDeep }}>
              ▼
            </Text>
          </Pressable>
        </View>

        <AuthField
          label="Email"
          icon="mail-outline"
          placeholder="Enter email address"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          value={form.email}
          onChangeText={(v) => handleChange("email", v)}
        />

        <AuthField
          label="Password"
          icon="lock-closed-outline"
          placeholder="Create a password"
          secureTextEntry={!showPassword}
          value={form.password}
          onChangeText={(v) => handleChange("password", v)}
          secureToggle={{
            visible: showPassword,
            onToggle: () => setShowPassword((value) => !value),
          }}
        />

        {isError ? (
          <View
            className="rounded-2xl px-4 py-3"
            style={{ backgroundColor: "#FEF2F2", borderWidth: 1, borderColor: "#FECACA" }}
          >
            <Text className="text-sm" style={{ color: colors.danger }}>
              {getErrorMessage()}
            </Text>
          </View>
        ) : null}

        <Pressable
          className="mt-2 items-center rounded-[24px] py-4"
          style={{ backgroundColor: isPending || !isFormValid ? "#D1D5DB" : colors.ink }}
          onPress={handleRegister}
          disabled={isPending || !isFormValid}
        >
          {isPending ? (
            <ActivityIndicator color={colors.gold} />
          ) : (
            <Text className="text-base font-semibold" style={{ color: colors.goldSoft }}>
              Create Account
            </Text>
          )}
        </Pressable>
      </View>

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
            className="rounded-t-3xl pb-8"
            accessibilityViewIsModal
            accessible
          >
            <View
              className="absolute inset-0 rounded-t-3xl"
              style={{ backgroundColor: colors.surfaceStrong }}
            />
            <View className="items-center pt-3 pb-2">
              <View className="w-10 h-1 bg-gray-300 rounded-full" />
            </View>
            <Text className="px-6 py-3 text-lg font-bold" style={{ color: colors.ink }}>
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
                          ? "font-semibold"
                          : "text-gray-700"
                      }`}
                      style={isSelected ? { color: colors.ink } : undefined}
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
    </AuthShell>
  );
}
