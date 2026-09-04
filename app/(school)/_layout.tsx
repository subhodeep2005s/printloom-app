import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
	createTabScreenOptions,
	tabOptions,
} from "@/shared/components/navigation/tabStyles";

export default function SchoolLayout() {
	const insets = useSafeAreaInsets();

	return (
		<Tabs screenOptions={createTabScreenOptions(insets)}>
			<Tabs.Screen
				name="dashboard"
				options={tabOptions("Home", "grid", "grid-outline")}
			/>

			<Tabs.Screen
				name="datasheet"
				options={tabOptions(
					"Records",
					"document-text",
					"document-text-outline",
				)}
			/>

			<Tabs.Screen
				name="import"
				options={tabOptions("Import", "cloud-upload", "cloud-upload-outline")}
			/>

			<Tabs.Screen
				name="profile"
				options={tabOptions("Profile", "person", "person-outline")}
			/>

			{/* Hide old tabs that still exist as files */}
			<Tabs.Screen name="students" options={{ href: null }} />
			<Tabs.Screen name="upload" options={{ href: null }} />
		</Tabs>
	);
}
