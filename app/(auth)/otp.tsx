import { useResendOtp, useVerifyOtp } from "@/app/shared/api/auth.query";
import { router } from "expo-router";
import { useState, useEffect, useRef } from "react";
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

export default function OtpScreen() {
  const params = useLocalSearchParams();
  const email =
    typeof params.email === "string"
      ? params.email
      : params.email?.[0] ?? "";

  if (__DEV__ && email) {
    console.log("📧 [OTP] Screen loaded with email:", email);
  }

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
    isSuccess: resendSuccess,
  } = useResendOtp();

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

    if (__DEV__) {
      console.log("🔐 [OTP] Verifying with:", { email, code, codeLength: code.length });
    }

    verifyOtp(
      { email, otp: code },
      {
        onSuccess: (data) => {
          if (__DEV__) {
            console.log("✅ [OTP] Verification success:", data);
          }
          router.replace("/login");
        },
        onError: (err: any) => {
          if (__DEV__) {
            console.log("❌ [OTP] Verification failed:", {
              message: err?.response?.data?.message,
              status: err?.response?.status,
              data: err?.response?.data,
            });
          }
        },
      }
    );
  };

  const handleResend = () => {
    if (!canResend) return;

    resendOtp({ email }, {
      onSuccess: () => {
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
            Verify OTP
          </Text>
        </View>

        <View className="flex-1 px-6 justify-center">
          <View className="mb-12">
            <View className="w-16 h-16 bg-yellow-400 rounded-2xl items-center justify-center mb-6">
              <Text className="text-black text-3xl font-bold">✓</Text>
            </View>
            <Text className="text-3xl font-bold text-black">
              Verification
            </Text>
            <Text className="text-3xl font-bold text-black">Code</Text>
            <Text className="text-gray-500 mt-3 text-base">
              We sent a code to{"\n"}
              <Text className="text-black font-medium">{email}</Text>
            </Text>
          </View>

          <View className="flex-row justify-between mb-8">
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => { inputRefs.current[index] = ref; }}
                className="w-12 h-14 bg-gray-50 border border-gray-200 rounded-xl text-center text-2xl font-bold text-black"
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onChangeText={(value) => handleOtpChange(value, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
              />
            ))}
          </View>

          {isVerifyError && (
            <View className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
              <Text className="text-red-600 text-sm text-center">
                {getErrorMessage()}
              </Text>
            </View>
          )}

          <Pressable
            className={`rounded-xl py-4 items-center mb-6 ${
              isVerifying || otp.join("").length !== 6 ? "bg-gray-300" : "bg-black"
            }`}
            onPress={() => handleVerify()}
            disabled={isVerifying || otp.join("").length !== 6}
          >
            {isVerifying ? (
              <ActivityIndicator color="#FBBF24" />
            ) : (
              <Text className="text-yellow-400 font-semibold text-base">
                Verify
              </Text>
            )}
          </Pressable>

          <View className="flex-row justify-center items-center">
            <Text className="text-gray-500 text-sm">
              {canResend ? "Didn't receive code? " : "Resend in "}
            </Text>
            {canResend ? (
              <Pressable
                onPress={handleResend}
                disabled={isResending}
              >
                {isResending ? (
                  <ActivityIndicator size="small" color="#FBBF24" />
                ) : (
                  <Text className="text-yellow-500 font-semibold text-sm">
                    Resend
                  </Text>
                )}
              </Pressable>
            ) : (
              <Text className="text-black font-semibold text-sm">
                {timer}s
              </Text>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function useLocalSearchParams() {
  const { useLocalSearchParams } = require("expo-router");
  return useLocalSearchParams();
}
