/**
 * AlertDialog — shadcn/ui-style confirmation dialog for React Native.
 *
 * Usage:
 *   <AlertDialog
 *     visible={open}
 *     title="Are you absolutely sure?"
 *     description="This action cannot be undone."
 *     confirmLabel="Delete"
 *     confirmDestructive
 *     onConfirm={handleDelete}
 *     onCancel={() => setOpen(false)}
 *   />
 */

import React, { useEffect, useRef } from "react";
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface AlertDialogProps {
  visible: boolean;
  title: string;
  description?: string;
  cancelLabel?: string;
  confirmLabel?: string;
  /** Renders the confirm button in red */
  confirmDestructive?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  /** Disable buttons while an async action is in flight */
  loading?: boolean;
}

export function AlertDialog({
  visible,
  title,
  description,
  cancelLabel = "Cancel",
  confirmLabel = "Continue",
  confirmDestructive = false,
  onCancel,
  onConfirm,
  loading = false,
}: AlertDialogProps) {
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 120,
          friction: 10,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.95);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      {/* Overlay */}
      <Pressable style={styles.overlay} onPress={onCancel}>
        <Animated.View
          style={[
            styles.dialog,
            { opacity: opacityAnim, transform: [{ scale: scaleAnim }] },
          ]}
        >
          {/* Prevent overlay tap from closing when tapping inside */}
          <Pressable onPress={() => {}}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              {description ? (
                <Text style={styles.description}>{description}</Text>
              ) : null}
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Footer */}
            <View style={styles.footer}>
              {/* Cancel */}
              <Pressable
                style={({ pressed }) => [
                  styles.btn,
                  styles.btnCancel,
                  pressed && styles.btnCancelPressed,
                ]}
                onPress={onCancel}
                disabled={loading}
              >
                <Text style={styles.btnCancelText}>{cancelLabel}</Text>
              </Pressable>

              {/* Confirm */}
              <Pressable
                style={({ pressed }) => [
                  styles.btn,
                  confirmDestructive ? styles.btnDestructive : styles.btnPrimary,
                  pressed && (confirmDestructive
                    ? styles.btnDestructivePressed
                    : styles.btnPrimaryPressed),
                  loading && styles.btnDisabled,
                ]}
                onPress={onConfirm}
                disabled={loading}
              >
                <Text
                  style={[
                    styles.btnConfirmText,
                    confirmDestructive
                      ? styles.btnDestructiveText
                      : styles.btnPrimaryText,
                  ]}
                >
                  {confirmLabel}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  dialog: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    overflow: "hidden",
    // Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: "#09090b",
    letterSpacing: -0.2,
  },
  description: {
    fontSize: 14,
    color: "#71717a",
    marginTop: 6,
    lineHeight: 20,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#e4e4e7",
    marginHorizontal: 0,
  },
  footer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  btn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  // Cancel — outline style
  btnCancel: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e4e4e7",
  },
  btnCancelPressed: {
    backgroundColor: "#f4f4f5",
  },
  btnCancelText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#09090b",
  },
  // Primary (non-destructive)
  btnPrimary: {
    backgroundColor: "#09090b",
  },
  btnPrimaryPressed: {
    backgroundColor: "#27272a",
  },
  btnPrimaryText: {
    color: "#fafafa",
  },
  // Destructive
  btnDestructive: {
    backgroundColor: "#ef4444",
  },
  btnDestructivePressed: {
    backgroundColor: "#dc2626",
  },
  btnDestructiveText: {
    color: "#ffffff",
  },
  btnConfirmText: {
    fontSize: 14,
    fontWeight: "600",
  },
  btnDisabled: {
    opacity: 0.5,
  },
});
