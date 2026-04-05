import { View, Text, StyleSheet } from "react-native";
import React from "react";

export default function students() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Students</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
  },
});
