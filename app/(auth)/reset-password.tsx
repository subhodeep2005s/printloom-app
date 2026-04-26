import { useResetPassword } from "@/app/shared/api/auth.query";
import { AuthField } from "@/app/shared/components/auth/AuthField";
import { AuthShell } from "@/app/shared/components/auth/AuthShell";
import { useToast } from "@/app/shared/components/Toast";
import { colors } from "@/app/shared/constants/theme";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

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

  const toast = useToast();

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
        onSuccess: () => {
          toast.show({
            type: "success",
            title: "Password Reset!",
            message: "You can now sign in with your new password",
          });
        },
      }
    );
  };

  const getErrorMessage = () => {
    if (!isError || !error) return null;
    const err = error as any;
    return err?.response?.data?.message || "Reset failed";
  };

  return (
    <AuthShell
      backButton
      eyebrow="Password update"
      title="Choose a new password"
      subtitle="Enter the reset code you received and set a fresh password for your account."
    >
      {isSuccess ? (
        <View
          className="rounded-[24px] p-6"
          style={{ backgroundColor: "#F0FDF4", borderWidth: 1, borderColor: "#BBF7D0" }}
        >
          <Text className="text-center text-xl font-semibold" style={{ color: colors.success }}>
            Password Reset
          </Text>
          <Text className="mt-2 text-center text-sm" style={{ color: colors.inkSoft }}>
            Your password has been updated successfully.
          </Text>
          <Pressable
            className="mt-5 items-center rounded-[20px] py-3"
            style={{ backgroundColor: colors.ink }}
            onPress={() => router.replace("/(auth)/login")}
          >
            <Text className="font-semibold" style={{ color: colors.goldSoft }}>
              Sign In
            </Text>
          </Pressable>
        </View>
      ) : (
        <View className="gap-4">
          <AuthField
            label="Reset Code"
            icon="key-outline"
            placeholder="Enter reset code"
            autoCapitalize="none"
            autoCorrect={false}
            value={otp}
            onChangeText={setOtp}
          />

          <AuthField
            label="New Password"
            icon="lock-closed-outline"
            placeholder="Min. 6 characters"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            secureToggle={{
              visible: showPassword,
              onToggle: () => setShowPassword((value) => !value),
            }}
          />

          <AuthField
            label="Confirm Password"
            icon="shield-checkmark-outline"
            placeholder="Confirm new password"
            secureTextEntry={!showPassword}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            error={confirmPassword && !passwordsMatch ? "Passwords don’t match" : null}
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
            onPress={handleSubmit}
            disabled={isPending || !isFormValid}
          >
            {isPending ? (
              <ActivityIndicator color={colors.gold} />
            ) : (
              <Text className="text-base font-semibold" style={{ color: colors.goldSoft }}>
                Reset Password
              </Text>
            )}
          </Pressable>
        </View>
      )}
    </AuthShell>
  );
}
