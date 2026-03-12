import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import Colors from "@/constants/colors";

const { CYBER } = Colors;

interface CyberCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  glowColor?: string;
  padding?: number;
}

export default function CyberCard({ children, style, glowColor = CYBER.cyan, padding = 16 }: CyberCardProps) {
  return (
    <View style={[
      styles.card,
      {
        borderColor: glowColor + "40",
        shadowColor: glowColor,
        padding,
      },
      style,
    ]}>
      <View style={[styles.topLine, { backgroundColor: glowColor }]} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: CYBER.surface,
    borderRadius: 16,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    overflow: "hidden",
  },
  topLine: {
    position: "absolute",
    top: 0,
    left: 16,
    right: 16,
    height: 2,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    opacity: 0.8,
  },
});
