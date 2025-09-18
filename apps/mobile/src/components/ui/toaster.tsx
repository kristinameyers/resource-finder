// apps/mobile/src/components/ui/Toaster.tsx

import React, { useRef, useImperativeHandle, useState } from "react";
import { Animated, Text, View, StyleSheet, Dimensions } from "react-native";

export interface ToasterRef {
  show: (message: string, duration?: number) => void;
}

const { width } = Dimensions.get("window");

export const Toaster = React.forwardRef<ToasterRef, {}>((props, ref) => {
  const [msg, setMsg] = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useImperativeHandle(ref, () => ({
    show(message: string, duration = 2500) {
      setMsg(message);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();

      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start(() => setMsg(null));
      }, duration);
    },
  }));

  if (!msg) return null;

  return (
    <Animated.View style={[styles.toast, { opacity: fadeAnim, width: width * 0.9 }]}>
      <Text style={styles.text}>{msg}</Text>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    bottom: 48,
    left: "5%",
    backgroundColor: "#333",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 22,
    elevation: 4,
    justifyContent: "center",
    alignItems: "center"
  },
  text: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center"
  },
});

export default Toaster;
