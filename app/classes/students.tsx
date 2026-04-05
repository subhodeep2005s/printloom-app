import { View, Text, StyleSheet } from "react-native";
import React from "react";

export default function students() {
  return (
    <View style={styles.container}>
      <Text style={styles.comingSoon}>Coming Soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  comingSoon: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#666",
  },
});
