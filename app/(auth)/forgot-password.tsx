import { useForgotPassword } from "@/app/shared/api/auth.query";
import { AuthField } from "@/app/shared/components/auth/AuthField";
import { AuthShell } from "@/app/shared/components/auth/AuthShell";
import { colors } from "@/app/shared/constants/theme";
import { useToast } from "@/app/shared/components/Toast";
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");

  const {
    mutate: forgotPassword,
    isPending,
    isSuccess,
    isError,
    error,
  } = useForgotPassword();

  const toast = useToast();

  const handleSubmit = () => {
    if (!email.trim()) return;

    forgotPassword(
      { email: email.trim() },
      {
        onSuccess: () => {
          toast.show({
            type: "success",
            title: "Email Sent!",
            message: "Check your email for the reset code",
          });
        },
      }
    );
  };

  const getErrorMessage = () => {
    if (!isError || !error) return null;
    const err = error as any;
    return err?.response?.data?.message || "Something went wrong";
  };

  return (
    <AuthShell
      backButton
      eyebrow="Recovery"
      title="Reset your password"
      subtitle="Enter the email linked to your workspace and we’ll send a reset code."
    >
      {isSuccess ? (
        <View
          className="rounded-[24px] p-6"
          style={{ backgroundColor: "#F0FDF4", borderWidth: 1, borderColor: "#BBF7D0" }}
        >
          <Text className="text-lg font-semibold" style={{ color: colors.success }}>
            Email Sent
          </Text>
          <Text className="mt-2 text-sm leading-6" style={{ color: colors.inkSoft }}>
            If an account exists for this email, a reset link has been sent.
          </Text>
          <Pressable
            className="mt-5 items-center rounded-[20px] py-3"
            style={{ backgroundColor: colors.ink }}
            onPress={() => router.replace("/(auth)/login")}
          >
            <Text className="font-semibold" style={{ color: colors.goldSoft }}>
              Back to Login
            </Text>
          </Pressable>
        </View>
      ) : (
        <View className="gap-4">
          <AuthField
            label="Email Address"
            icon="mail-outline"
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
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
            className="items-center rounded-[24px] py-4"
            style={{ backgroundColor: isPending || !email.trim() ? "#D1D5DB" : colors.ink }}
            onPress={handleSubmit}
            disabled={isPending || !email.trim()}
          >
            {isPending ? (
              <ActivityIndicator color={colors.gold} />
            ) : (
              <Text className="text-base font-semibold" style={{ color: colors.goldSoft }}>
                Send Reset Code
              </Text>
            )}
          </Pressable>

          <View className="flex-row justify-center">
            <Text className="text-sm" style={{ color: colors.inkSoft }}>
              Remember your password?{" "}
            </Text>
            <Pressable onPress={() => router.back()}>
              <Text className="text-sm font-semibold" style={{ color: colors.ink }}>
                Sign In
              </Text>
            </Pressable>
          </View>

          <Pressable
            className="items-center py-2"
            onPress={() =>
              router.push({ pathname: "/(auth)/reset-password", params: { email } })
            }
          >
            <Text className="text-sm font-semibold" style={{ color: colors.goldDeep }}>
              Already have a reset code?
            </Text>
          </Pressable>
        </View>
      )}
    </AuthShell>
  );
}
