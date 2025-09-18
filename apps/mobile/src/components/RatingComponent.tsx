import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useVoting } from "../hooks/use-voting";

interface RatingComponentProps {
  resourceId: string;
  thumbsUp: number;
  thumbsDown: number;
  userVote?: 'up' | 'down' | null;
  style?: any;
}

export default function RatingComponent({ 
  resourceId, 
  thumbsUp, 
  thumbsDown, 
  userVote, 
  style 
}: RatingComponentProps) {
  const { handleVote, isSubmitting } = useVoting(resourceId);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[
            styles.button,
            userVote === 'up' && styles.buttonUp,
            isSubmitting && styles.buttonDisabled
          ]}
          onPress={() => handleVote('up', userVote)}
          disabled={isSubmitting}
        >
          <Ionicons name="thumbs-up" size={20} color={userVote === "up" ? "#fff" : "#222"} />
          <Text style={[styles.count, userVote === "up" && styles.countActive]}>{thumbsUp}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.button,
            userVote === 'down' && styles.buttonDown,
            isSubmitting && styles.buttonDisabled
          ]}
          onPress={() => handleVote('down', userVote)}
          disabled={isSubmitting}
        >
          <Ionicons name="thumbs-down" size={20} color={userVote === "down" ? "#fff" : "#222"} />
          <Text style={[styles.count, userVote === "down" && styles.countActive]}>{thumbsDown}</Text>
        </TouchableOpacity>
      </View>
      <View>
        <Text style={styles.status}>
          {thumbsUp + thumbsDown === 0 
            ? "Be the first to rate this resource" 
            : `${thumbsUp + thumbsDown} ${thumbsUp + thumbsDown === 1 ? 'vote' : 'votes'}`
          }
        </Text>
        {isSubmitting && <ActivityIndicator size="small" color="#256BAE" style={{ marginTop: 5 }} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", alignItems: "center", gap: 14 },
  buttonRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
    gap: 8,
  },
  buttonUp: { backgroundColor: "#45c590" },
  buttonDown: { backgroundColor: "#ef4444" },
  buttonDisabled: { opacity: 0.7 },
  count: { fontSize: 16, color: "#222" },
  countActive: { color: "#fff", fontWeight: "bold" },
  status: { fontSize: 14, color: "#666", marginLeft: 16, marginTop: 2 },
});
