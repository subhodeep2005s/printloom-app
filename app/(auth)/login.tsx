import { useLogin } from "@/app/shared/api/auth.query";
import { AuthField } from "@/app/shared/components/auth/AuthField";
import { AuthShell } from "@/app/shared/components/auth/AuthShell";
import { useToast } from "@/app/shared/components/Toast";
import { colors } from "@/app/shared/constants/theme";
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { mutate, isPending, isError, error } = useLogin();
  const toast = useToast();

  const handleLogin = () => {
    if (!email.trim() || !password.trim()) return;

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
    return err?.response?.data?.message || "Invalid credentials";
  };

  return (
    <AuthShell
      eyebrow="Secure access"
      title="Sign in to PrintLoom"
      subtitle="Manage datasets, imports, and ID card printing from a cleaner mobile workspace."
      heroImage={require("../../assets/images/login.png")}
      footer={(
        <View className="flex-row items-center justify-center">
          <Text className="text-sm" style={{ color: colors.inkSoft }}>
            Don&apos;t have an account?{" "}
          </Text>
          <Pressable onPress={() => router.push("/(auth)/register")}>
            <Text className="text-sm font-semibold" style={{ color: colors.ink }}>
              Register
            </Text>
          </Pressable>
        </View>
      )}
    >
      <View className="gap-4">
        <AuthField
          label="Email"
          icon="mail-outline"
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          value={email}
          onChangeText={setEmail}
        />

        <AuthField
          label="Password"
          icon="lock-closed-outline"
          placeholder="Enter your password"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
          secureToggle={{
            visible: showPassword,
            onToggle: () => setShowPassword((value) => !value),
          }}
        />

        <Pressable
          className="self-end px-1"
          onPress={() => router.push("/(auth)/forgot-password")}
        >
          <Text className="text-sm font-semibold" style={{ color: colors.goldDeep }}>
            Forgot password?
          </Text>
        </Pressable>

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
          style={{
            backgroundColor:
              isPending || !email.trim() || !password.trim() ? "#D1D5DB" : colors.ink,
          }}
          onPress={handleLogin}
          disabled={isPending || !email.trim() || !password.trim()}
        >
          {isPending ? (
            <ActivityIndicator color={colors.gold} />
          ) : (
            <Text className="text-base font-semibold" style={{ color: colors.goldSoft }}>
              Sign In
            </Text>
          )}
        </Pressable>
      </View>
    </AuthShell>
  );
}
