import {
	useDeleteAccount,
	useForgotPassword,
	useLogout,
	useMe,
	useResetPassword,
} from "@/app/shared/api/auth.query";
import { useToast } from "@/app/shared/components/Toast";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useState } from "react";
import {
	ActivityIndicator,
	Alert,
	Linking,
	Modal,
	Pressable,
	RefreshControl,
	ScrollView,
	Text,
	TextInput,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ORG_LABELS: Record<string, string> = {
	organization: "Organization",
	college: "College",
	university: "University",
	coaching: "Coaching",
	company: "Company",
	ngo: "NGO",
	government: "Government",
	other: "Other",
};

export default function ProfileScreen() {
	const { data: user, isLoading, refetch } = useMe();
	const logout = useLogout();
	const { mutate: deleteAccount, isPending: deletingAccount } =
		useDeleteAccount();
	const toast = useToast();
	const [refreshing, setRefreshing] = useState(false);
	const [loggingOut, setLoggingOut] = useState(false);
	const [showPasswordModal, setShowPasswordModal] = useState(false);

	const onRefresh = async () => {
		await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		setRefreshing(true);
		await refetch();
		setRefreshing(false);
	};

	const handleLogout = async () => {
		await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
		setLoggingOut(true);
		try {
			await logout();
			toast.show({
				type: "success",
				title: "Logged Out",
				message: "See you next time!",
			});
			router.replace("/(auth)/login");
		} catch {
			toast.show({
				type: "error",
				title: "Error",
				message: "Failed to log out",
			});
		} finally {
			setLoggingOut(false);
		}
	};

	const handleDeleteAccount = async () => {
		await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

		Alert.alert(
			"Delete Account",
			"Are you sure you want to delete your account? This action cannot be undone.",
			[
				{
					text: "Cancel",
					style: "cancel",
					onPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
				},
				{
					text: "Delete",
					style: "destructive",
					onPress: async () => {
						deleteAccount(undefined, {
							onSuccess: async () => {
								await Haptics.notificationAsync(
									Haptics.NotificationFeedbackType.Success,
								);
								toast.show({
									type: "success",
									title: "Account Deleted",
									message: "Your account has been deleted",
								});
								router.replace("/(auth)/login");
							},
							onError: (err: any) => {
								toast.show({
									type: "error",
									title: "Error",
									message:
										err?.response?.data?.message || "Failed to delete account",
								});
							},
						});
					},
				},
			],
		);
	};

	const getInitials = (name: string) =>
		name
			.split(" ")
			.map((w) => w[0])
			.join("")
			.toUpperCase()
			.slice(0, 2);

	if (isLoading) {
		return (
			<SafeAreaView className="flex-1 bg-white justify-center items-center">
				<ActivityIndicator size="large" color="#EAB308" />
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView className="flex-1 bg-white">
			<ScrollView
				className="flex-1"
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ paddingBottom: 120 }}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={onRefresh}
						tintColor="#EAB308"
					/>
				}
			>
				{/* Header Title */}
				<View className="px-6 pt-4 pb-6">
					<Text className="text-2xl font-bold text-black text-center">
						Profile
					</Text>
				</View>

				{/* Avatar Section */}
				<View className="items-center pb-6">
					{/* Avatar Circle */}
					<View
						className="w-24 h-24 rounded-full bg-yellow-400 items-center justify-center mb-4"
						style={{
							shadowColor: "#EAB308",
							shadowOffset: { width: 0, height: 4 },
							shadowOpacity: 0.25,
							shadowRadius: 12,
							elevation: 8,
						}}
					>
						<Text className="text-black text-3xl font-bold">
							{user?.name ? getInitials(user.name) : "?"}
						</Text>
					</View>

					{/* Name & Org Type */}
					<Text className="text-xl font-bold text-black">
						{user?.name || "—"}
					</Text>
					{user?.organizationType && (
						<Text className="text-gray-400 text-sm mt-1">
							@
							{ORG_LABELS[user.organizationType]?.toLowerCase() ||
								user.organizationType}
						</Text>
					)}

					{/* Edit Profile Button */}
					<Pressable
						className="mt-4 bg-black rounded-full px-8 py-2.5 active:bg-gray-800"
						onPress={async () => {
							await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
						}}
					>
						<Text className="text-yellow-400 font-semibold text-sm">
							Edit Profile
						</Text>
					</Pressable>
				</View>

				{/* Divider */}
				<View className="h-px bg-gray-100 mx-6" />

				{/* Info Fields */}
				<View className="px-6 mt-6">
					<InfoField label="Full name" value={user?.name || "—"} />
					<View style={{ marginTop: 12 }}>
						<View className="flex-row">
							<View className="flex-1 mr-2">
								<InfoField
									label="Role"
									value={(user?.role || "—").toUpperCase()}
								/>
							</View>
							<View className="flex-1 ml-2">
								<InfoField
									label="Joined"
									value={
										user?.createdAt
											? new Date(user.createdAt).toLocaleDateString("en-US", {
													month: "short",
													day: "2-digit",
													year: "numeric",
												})
											: "—"
									}
								/>
							</View>
						</View>
					</View>
					<View style={{ marginTop: 12 }}>
						<InfoField
							label="Phone number"
							value={user?.mobileNumber || "Not set"}
						/>
					</View>
					<View style={{ marginTop: 12 }}>
						<InfoField label="Email" value={user?.email || "—"} />
					</View>
					<View style={{ marginTop: 12 }}>
						<InfoField label="Organization ID" value={user?.id || "—"} mono />
					</View>
				</View>

				{/* Divider */}
				<View className="h-px bg-gray-100 mx-6 mt-6" />

				{/* Promo Banner */}
				<View className="px-6 mt-6 mb-2">
					<Pressable
						className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex-row items-center active:bg-yellow-100"
						onPress={() => Linking.openURL("https://printloom.in")}
					>
						<View className="bg-yellow-200 w-10 h-10 rounded-full items-center justify-center mr-3">
							<Ionicons name="globe-outline" size={20} color="#CA8A04" />
						</View>
						<View className="flex-1">
							<Text className="text-yellow-800 font-bold text-sm">
								Visit PrintLoom.in
							</Text>
							<Text className="text-yellow-600 text-xs mt-0.5">
								For a better & complete experience
							</Text>
						</View>
						<Ionicons name="open-outline" size={16} color="#CA8A04" />
					</Pressable>
				</View>

				{/* Menu Items */}
				<View className="px-6 mt-2">
					<MenuItem
						icon="lock-closed-outline"
						label="Change Password"
						onPress={() => {
							Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
							setShowPasswordModal(true);
						}}
					/>
					<MenuItem
						icon="help-circle-outline"
						label="Help & Support"
						onPress={() => {
							Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
							Linking.openURL("mailto:printloomofficial@gmail.com");
						}}
					/>
					<Pressable
						className="flex-row items-center py-4 active:opacity-60"
						onPress={handleDeleteAccount}
						disabled={deletingAccount}
					>
						<View className="w-10 h-10 bg-red-50 rounded-xl items-center justify-center">
							{deletingAccount ? (
								<ActivityIndicator color="#EF4444" size="small" />
							) : (
								<Ionicons name="trash-outline" size={20} color="#EF4444" />
							)}
						</View>
						<Text className="text-red-500 font-medium text-base ml-3 flex-1">
							{deletingAccount ? "Deleting account..." : "Delete my account"}
						</Text>
					</Pressable>
				</View>

				{/* Divider */}
				<View className="h-px bg-gray-100 mx-6 mt-2" />

				{/* Logout */}
				<View className="px-6 mt-2">
					<Pressable
						className="flex-row items-center py-4 active:opacity-60"
						onPress={handleLogout}
						disabled={loggingOut}
					>
						<View className="w-10 h-10 bg-red-50 rounded-xl items-center justify-center">
							{loggingOut ? (
								<ActivityIndicator color="#EF4444" size="small" />
							) : (
								<Ionicons name="log-out-outline" size={20} color="#EF4444" />
							)}
						</View>
						<Text className="text-red-500 font-semibold text-base ml-3">
							{loggingOut ? "Logging out..." : "Log out"}
						</Text>
					</Pressable>
				</View>
			</ScrollView>

			{showPasswordModal && user?.email && (
				<ChangePasswordModal
					email={user.email}
					onClose={() => setShowPasswordModal(false)}
				/>
			)}
		</SafeAreaView>
	);
}

// ─── Info Field ─────────────────────────────────────────────

function InfoField({
	label,
	value,
	mono,
}: {
	label: string;
	value: string;
	mono?: boolean;
}) {
	return (
		<View className="border border-gray-200 rounded-2xl px-4 py-3.5">
			<Text className="text-xs text-gray-400 mb-0.5">{label}</Text>
			<Text
				className={`text-black text-sm font-medium ${mono ? "font-mono" : ""}`}
				numberOfLines={1}
			>
				{value}
			</Text>
		</View>
	);
}

// ─── Menu Item ──────────────────────────────────────────────

function MenuItem({
	icon,
	label,
	onPress,
}: {
	icon: keyof typeof Ionicons.glyphMap;
	label: string;
	onPress: () => void;
}) {
	return (
		<Pressable
			className="flex-row items-center py-4 active:opacity-60"
			onPress={onPress}
		>
			<View className="w-10 h-10 bg-gray-50 rounded-xl items-center justify-center">
				<Ionicons name={icon} size={20} color="#000" />
			</View>
			<Text className="text-black font-medium text-base ml-3 flex-1">
				{label}
			</Text>
			<Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
		</Pressable>
	);
}

// ─── Change Password Modal ───────────────────────────────────

function ChangePasswordModal({
	email,
	onClose,
}: {
	email: string;
	onClose: () => void;
}) {
	const [step, setStep] = useState<"req" | "verify">("req");
	const [otp, setOtp] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	const toast = useToast();
	const { mutate: sendResetCode, isPending: sending } = useForgotPassword();
	const { mutate: resetPassword, isPending: resetting } = useResetPassword();

	const handleSendOtp = () => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		sendResetCode(
			{ email },
			{
				onSuccess: () => {
					toast.show({
						type: "success",
						title: "Reset code sent",
						message: "Check your email for the reset code.",
					});
					setStep("verify");
				},
				onError: (err: any) => {
					toast.show({
						type: "error",
						title: "Error",
						message: err?.response?.data?.message || "Failed to send reset code",
					});
				},
			},
		);
	};

	const handleReset = () => {
		if (!otp) {
			toast.show({
				type: "error",
				title: "Error",
				message: "Please enter OTP",
			});
			return;
		}
		if (password !== confirmPassword) {
			toast.show({
				type: "error",
				title: "Error",
				message: "Passwords do not match",
			});
			return;
		}
		if (password.length < 6) {
			toast.show({
				type: "error",
				title: "Error",
				message: "Password must be at least 6 characters",
			});
			return;
		}

		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
		resetPassword(
			{ email, otp, password },
			{
				onSuccess: () => {
					Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
					toast.show({
						type: "success",
						title: "Success",
						message: "Password changed successfully",
					});
					onClose();
				},
				onError: (err: any) => {
					toast.show({
						type: "error",
						title: "Error",
						message: err?.response?.data?.message || "Failed to reset password",
					});
				},
			},
		);
	};

	return (
		<Modal visible transparent animationType="fade">
			<View className="flex-1 bg-black/40 justify-center items-center px-4">
				<View className="bg-white rounded-3xl p-6 w-full max-w-sm">
					<View className="w-12 h-12 bg-yellow-100 rounded-full items-center justify-center mb-4">
						<Ionicons name="lock-closed" size={24} color="#CA8A04" />
					</View>
					<Text className="text-xl font-bold text-black mb-2">
						Change Password
					</Text>
					<Text className="text-gray-500 text-sm mb-6">
						{step === "req"
							? `We will send a reset code to ${email}.`
							: "Enter the code we sent to your email and your new password."}
					</Text>

					{step === "req" ? (
						<View>
							<Pressable
								className={`rounded-2xl py-3.5 mb-3 items-center ${sending ? "bg-gray-800" : "bg-black"}`}
								onPress={handleSendOtp}
								disabled={sending}
							>
								{sending ? (
									<ActivityIndicator color="#EAB308" />
								) : (
									<Text className="text-yellow-400 font-bold text-base">
										Send Code
									</Text>
								)}
							</Pressable>
							<Pressable
								className="py-3 items-center"
								onPress={onClose}
								disabled={sending}
							>
								<Text className="text-gray-500 font-medium">Cancel</Text>
							</Pressable>
						</View>
					) : (
						<View>
							<TextInput
								className="border border-gray-200 rounded-xl px-4 py-3 text-black mb-3 text-center tracking-widest text-lg font-mono"
								placeholder="000000"
								placeholderTextColor="#9CA3AF"
								value={otp}
								onChangeText={setOtp}
								keyboardType="number-pad"
								maxLength={6}
							/>
							<TextInput
								className="border border-gray-200 rounded-xl px-4 py-3 text-black mb-3"
								placeholder="New Password"
								placeholderTextColor="#9CA3AF"
								value={password}
								onChangeText={setPassword}
								secureTextEntry
							/>
							<TextInput
								className="border border-gray-200 rounded-xl px-4 py-3 text-black mb-5"
								placeholder="Confirm password"
								placeholderTextColor="#9CA3AF"
								value={confirmPassword}
								onChangeText={setConfirmPassword}
								secureTextEntry
							/>
							<Pressable
								className={`rounded-2xl py-3.5 mb-3 items-center ${resetting ? "bg-gray-800" : "bg-black"}`}
								onPress={handleReset}
								disabled={resetting}
							>
								{resetting ? (
									<ActivityIndicator color="#EAB308" />
								) : (
									<Text className="text-yellow-400 font-bold text-base">
										Reset Password
									</Text>
								)}
							</Pressable>
							<Pressable
								className="py-3 items-center"
								onPress={onClose}
								disabled={resetting}
							>
								<Text className="text-gray-500 font-medium">Cancel</Text>
							</Pressable>
						</View>
					)}
				</View>
			</View>
		</Modal>
	);
}
