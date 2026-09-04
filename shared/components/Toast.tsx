import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from "react";
import { Animated, Text, View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ToastType = "success" | "error" | "info";

interface ToastData {
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextType {
  show: (data: ToastData) => void;
}

const ToastContext = createContext<ToastContextType>({
  show: () => {},
});

export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastData | null>(null);
  const [visible, setVisible] = useState(false);
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const insets = useSafeAreaInsets();

  const hide = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
      setToast(null);
    });
  }, [translateY, opacity]);

  const show = useCallback(
    (data: ToastData) => {
      if (timeout.current) clearTimeout(timeout.current);

      setToast(data);
      setVisible(true);

      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 80,
          friction: 10,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      timeout.current = setTimeout(() => {
        hide();
      }, 3000);
    },
    [translateY, opacity, hide]
  );

  const getColors = (type: ToastType) => {
    switch (type) {
      case "success":
        return {
          bg: "#FFFBEB",
          border: "#FDE68A",
          icon: "✓",
          iconBg: "#000000",
          title: "#000000",
          message: "#4B5563",
        };
      case "error":
        return {
          bg: "#FEF2F2",
          border: "#FECACA",
          icon: "✕",
          iconBg: "#DC2626",
          title: "#991B1B",
          message: "#B91C1C",
        };
      case "info":
        return {
          bg: "#F9FAFB",
          border: "#E5E7EB",
          icon: "i",
          iconBg: "#000000",
          title: "#000000",
          message: "#6B7280",
        };
    }
  };

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {visible && toast && (
        <Animated.View
          style={[
            styles.container,
            {
              top: insets.top + 8,
              transform: [{ translateY }],
              opacity,
            },
          ]}
          pointerEvents="none"
        >
          <View
            style={[
              styles.toast,
              {
                backgroundColor: getColors(toast.type).bg,
                borderColor: getColors(toast.type).border,
              },
            ]}
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: getColors(toast.type).iconBg },
              ]}
            >
              <Text style={styles.iconText}>
                {getColors(toast.type).icon}
              </Text>
            </View>
            <View style={styles.textContainer}>
              <Text
                style={[
                  styles.title,
                  { color: getColors(toast.type).title },
                ]}
              >
                {toast.title}
              </Text>
              {toast.message && (
                <Text
                  style={[
                    styles.message,
                    { color: getColors(toast.type).message },
                  ]}
                >
                  {toast.message}
                </Text>
              )}
            </View>
          </View>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 9999,
    alignItems: "center",
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  iconText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
  },
  message: {
    fontSize: 13,
    marginTop: 2,
  },
});
