import React, { useRef, useEffect } from "react";
import { View, Image, Text, StyleSheet, Animated } from "react-native";

interface SplashScreenProps {
  isVisible: boolean;
}

export function SplashScreen({ isVisible }: SplashScreenProps) {
  const dotAnim = Array.from({ length: 3 }, () => useRef(new Animated.Value(0)).current);

  useEffect(() => {
    if (!isVisible) return;
    dotAnim.forEach((anim, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: -10, duration: 300, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]),
      ).start();
    });
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <View style={styles.splashContainer}>
      <View style={styles.logoContainer}>
        <Image
          source={require("../../assets/images/logo-2020_1754948553294.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      {/* Loading Dots */}
      <View style={styles.dotsRow}>
        {dotAnim.map((anim, i) => (
          <Animated.View
            key={i}
            style={[
              styles.dot,
              {
                transform: [{ translateY: anim }],
              },
            ]}
          />
        ))}
      </View>
      {/* Loading text */}
      <Text style={styles.loadingText}>Loading resources...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 99,
  },
  logoContainer: {
    marginBottom: 48,
    alignItems: "center",
  },
  logo: {
    width: 320,
    height: 100,
    marginBottom: 10,
  },
  dotsRow: {
    flexDirection: "row",
    gap: 14,
    marginVertical: 16,
    alignItems: "flex-end",
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#005191",
    marginHorizontal: 4,
  },
  loadingText: {
    marginTop: 16,
    color: "#666",
    fontSize: 16,
  },
});
