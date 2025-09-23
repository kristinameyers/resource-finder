import React, { useRef, useEffect } from "react";
import { View, StyleSheet, Animated, ViewStyle, DimensionValue } from "react-native";

interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = undefined,           // Use 'undefined' or a number or '50%'
  height = 20,
  borderRadius = 8,
  style = {},
}) => {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [shimmer]);

  const shimmerTranslate = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-40, 40],
  });

  return (
    <View
      style={[
        styles.skeleton,
        width !== undefined ? { width } : {},
        height !== undefined ? { height } : {},
        { borderRadius },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.shimmer,
          {
            borderRadius,
            transform: [{ translateX: shimmerTranslate }],
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: "#ececec",
    overflow: "hidden",
    position: "relative",
  },
  shimmer: {
    position: "absolute",
    left: 0,
    top: 0,
    height: "100%",
    width: 80,
    backgroundColor: "#f3f3f3",
    opacity: 0.7,
  },
});
