import { useResendOtp, useVerifyOtp } from "@/app/shared/api/auth.query";
import { AuthShell } from "@/app/shared/components/auth/AuthShell";
import { useToast } from "@/app/shared/components/Toast";
import { colors } from "@/app/shared/constants/theme";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

export default function OtpScreen() {
  const params = useLocalSearchParams();
  const email =
    typeof params.email === "string"
      ? params.email
      : params.email?.[0] ?? "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const {
    mutate: verifyOtp,
    isPending: isVerifying,
    isError: isVerifyError,
    error: verifyError,
  } = useVerifyOtp();

  const {
    mutate: resendOtp,
    isPending: isResending,
  } = useResendOtp();

  const toast = useToast();

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every((digit) => digit)) {
      handleVerify(newOtp.join(""));
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = (otpCode?: string) => {
    const code = otpCode || otp.join("");
    if (code.length !== 6) return;

    verifyOtp(
      { email, otp: code },
      {
        onSuccess: () => {
          toast.show({
            type: "success",
            title: "Email Verified!",
            message: "Your account is now verified",
          });
          router.replace("/login");
        },
      }
    );
  };

  const handleResend = () => {
    if (!canResend) return;

    resendOtp({ email }, {
      onSuccess: () => {
        toast.show({
          type: "success",
          title: "OTP Resent!",
          message: "Check your email for the new code",
        });
        setTimer(60);
        setCanResend(false);
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      },
    });
  };

  const getErrorMessage = () => {
    if (!isVerifyError || !verifyError) return null;
    const err = verifyError as any;
    return err?.response?.data?.message || "Invalid OTP";
  };

  return (
    <AuthShell
      backButton
      eyebrow="Verification"
      title="Confirm your email"
      subtitle={`We sent a 6-digit code to ${email || "your email address"}.`}
    >
      <View className="mb-6 flex-row justify-between">
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => {
              inputRefs.current[index] = ref;
            }}
            className="h-14 w-12 rounded-2xl border text-center text-2xl font-bold"
            style={{ backgroundColor: colors.surface, borderColor: colors.border, color: colors.ink }}
            keyboardType="number-pad"
            maxLength={1}
            value={digit}
            onChangeText={(value) => handleOtpChange(value, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
          />
        ))}
      </View>

      {isVerifyError ? (
        <View
          className="mb-4 rounded-2xl px-4 py-3"
          style={{ backgroundColor: "#FEF2F2", borderWidth: 1, borderColor: "#FECACA" }}
        >
          <Text className="text-center text-sm" style={{ color: colors.danger }}>
            {getErrorMessage()}
          </Text>
        </View>
      ) : null}

      <Pressable
        className="mb-6 items-center rounded-[24px] py-4"
        style={{ backgroundColor: isVerifying || otp.join("").length !== 6 ? "#D1D5DB" : colors.ink }}
        onPress={() => handleVerify()}
        disabled={isVerifying || otp.join("").length !== 6}
      >
        {isVerifying ? (
          <ActivityIndicator color={colors.gold} />
        ) : (
          <Text className="text-base font-semibold" style={{ color: colors.goldSoft }}>
            Verify
          </Text>
        )}
      </Pressable>

      <View className="flex-row items-center justify-center">
        <Text className="text-sm" style={{ color: colors.inkSoft }}>
          {canResend ? "Didn’t receive code? " : "Resend in "}
        </Text>
        {canResend ? (
          <Pressable onPress={handleResend} disabled={isResending}>
            {isResending ? (
              <ActivityIndicator size="small" color={colors.gold} />
            ) : (
              <Text className="text-sm font-semibold" style={{ color: colors.goldDeep }}>
                Resend
              </Text>
            )}
          </Pressable>
        ) : (
          <Text className="text-sm font-semibold" style={{ color: colors.ink }}>
            {timer}s
          </Text>
        )}
      </View>
    </AuthShell>
  );
}
