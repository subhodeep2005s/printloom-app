import { colors } from "@/app/shared/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import type { Tabs } from "expo-router";
import type { ComponentProps } from "react";
import type { EdgeInsets } from "react-native-safe-area-context";

type TabIconName = keyof typeof Ionicons.glyphMap;
type TabsScreenOptions = Exclude<
	ComponentProps<typeof Tabs>["screenOptions"],
	undefined
>;
type TabOptions = Exclude<TabsScreenOptions, (...args: never[]) => unknown>;

export function createTabScreenOptions(insets: EdgeInsets): TabOptions {
	return {
		headerShown: false,
		tabBarShowLabel: true,
		tabBarHideOnKeyboard: true,
		tabBarActiveTintColor: colors.goldDeep,
		tabBarInactiveTintColor: "#9CA3AF",
		tabBarStyle: {
			height: 62 + insets.bottom,
			borderTopWidth: 1,
			borderTopColor: colors.border,
			backgroundColor: colors.surfaceStrong,
			paddingTop: 6,
			paddingBottom: insets.bottom,
			shadowColor: "#000",
			shadowOpacity: 0.03,
			shadowRadius: 4,
			shadowOffset: { width: 0, height: -1 },
			elevation: 4,
		},
		tabBarLabelStyle: {
			fontSize: 11,
			fontWeight: "600",
			marginTop: 0,
			marginBottom: 2,
		},
		tabBarItemStyle: {
			paddingVertical: 2,
		},
		sceneStyle: {
			backgroundColor: colors.surface,
		},
	};
}

export function tabOptions(
	title: string,
	activeIcon: TabIconName,
	inactiveIcon = activeIcon,
): TabOptions {
	return {
		title,
		tabBarIcon: ({ focused, color }: { focused: boolean; color: string }) => (
			<Ionicons
				name={focused ? activeIcon : inactiveIcon}
				size={19}
				color={focused ? colors.goldDeep : color}
			/>
		),
	};
}
