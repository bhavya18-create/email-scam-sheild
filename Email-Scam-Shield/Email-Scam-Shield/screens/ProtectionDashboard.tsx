import React, { useRef, useEffect } from "react";
import {
  View, Text, StyleSheet, Animated, ScrollView, Linking, Platform
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import GlowButton from "@/components/cyber/GlowButton";
import CyberCard from "@/components/cyber/CyberCard";
import { useProfile } from "@/context/ProfileContext";

const { CYBER } = Colors;

export default function ProtectionDashboard() {
  const { profile, toggleProtection } = useProfile();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scanAnim = useRef(new Animated.Value(-100)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.timing(rotateAnim, { toValue: 1, duration: 8000, useNativeDriver: true })
    ).start();
  }, []);

  const spin = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });

  const handleEnableProtection = () => {
    toggleProtection();
    if (!profile.protectionEnabled) {
      if (Platform.OS === "android") {
        Linking.openSettings();
      }
    }
  };

  const indicators = [
    { icon: "email-alert", label: "Phishing Keywords", active: true },
    { icon: "link-variant-off", label: "Suspicious Links", active: true },
    { icon: "domain-off", label: "Fake Domains", active: true },
    { icon: "alert-circle", label: "Urgent Language", active: true },
    { icon: "account-alert", label: "Brand Spoofing", active: profile.protectionEnabled },
    { icon: "shield-check", label: "Real-time Scan", active: profile.protectionEnabled },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.shieldSection}>
        <Animated.View style={[styles.outerRing, {
          transform: [{ scale: pulseAnim }],
          borderColor: profile.protectionEnabled ? CYBER.cyan + "60" : CYBER.textDim + "40",
        }]} />
        <Animated.View style={[styles.middleRing, {
          borderColor: profile.protectionEnabled ? CYBER.blue + "50" : CYBER.textDim + "30",
          transform: [{ rotate: spin }],
        }]} />
        <View style={[styles.shieldCore, {
          borderColor: profile.protectionEnabled ? CYBER.cyan : CYBER.textDim,
          shadowColor: profile.protectionEnabled ? CYBER.cyan : "transparent",
        }]}>
          <MaterialCommunityIcons
            name={profile.protectionEnabled ? "shield-check" : "shield-off"}
            size={52}
            color={profile.protectionEnabled ? CYBER.cyan : CYBER.textDim}
          />
        </View>
      </View>

      <Text style={styles.title}>Protection Shield</Text>
      <Text style={styles.subtitle}>
        {profile.protectionEnabled
          ? "Your device is actively protected against email scams"
          : "Enable protection to scan email notifications for scam patterns"}
      </Text>

      <CyberCard
        glowColor={profile.protectionEnabled ? CYBER.cyan : CYBER.textDim}
        style={styles.statusCard}
      >
        <View style={styles.statusRow}>
          <View style={styles.statusLeft}>
            <View style={[styles.statusDot, {
              backgroundColor: profile.protectionEnabled ? CYBER.green : CYBER.red,
              shadowColor: profile.protectionEnabled ? CYBER.green : CYBER.red,
            }]} />
            <View>
              <Text style={styles.statusLabel}>Protection Status</Text>
              <Text style={[styles.statusValue, {
                color: profile.protectionEnabled ? CYBER.green : CYBER.red,
              }]}>
                {profile.protectionEnabled ? "ENABLED" : "DISABLED"}
              </Text>
            </View>
          </View>
          <MaterialCommunityIcons
            name="monitor-dashboard"
            size={28}
            color={profile.protectionEnabled ? CYBER.cyan : CYBER.textDim}
          />
        </View>
      </CyberCard>

      <GlowButton
        label={profile.protectionEnabled ? "Disable Protection" : "Enable Notification Protection"}
        onPress={handleEnableProtection}
        color={profile.protectionEnabled ? CYBER.red : CYBER.cyan}
        textColor={CYBER.background}
        size="lg"
        style={styles.mainButton}
      />

      <Text style={styles.sectionTitle}>Detection Modules</Text>
      <View style={styles.grid}>
        {indicators.map((item, i) => (
          <CyberCard
            key={i}
            glowColor={item.active ? CYBER.cyan : CYBER.textDim}
            padding={12}
            style={styles.indicatorCard}
          >
            <MaterialCommunityIcons
              name={item.icon as any}
              size={22}
              color={item.active ? CYBER.cyan : CYBER.textDim}
            />
            <Text style={[styles.indicatorLabel, { color: item.active ? CYBER.text : CYBER.textDim }]}>
              {item.label}
            </Text>
            <View style={[styles.activeChip, {
              backgroundColor: item.active ? CYBER.green + "20" : CYBER.textDim + "20",
              borderColor: item.active ? CYBER.green + "60" : CYBER.textDim + "40",
            }]}>
              <Text style={[styles.activeText, { color: item.active ? CYBER.green : CYBER.textDim }]}>
                {item.active ? "ON" : "OFF"}
              </Text>
            </View>
          </CyberCard>
        ))}
      </View>

      <CyberCard glowColor={CYBER.purple} style={styles.tipCard}>
        <View style={styles.tipRow}>
          <Ionicons name="information-circle" size={20} color={CYBER.purple} />
          <Text style={styles.tipTitle}>How it works</Text>
        </View>
        <Text style={styles.tipText}>
          When an email notification arrives from Gmail or Outlook, the app scans it for phishing keywords,
          suspicious domains, and scam patterns. If detected, you'll see an instant warning.
        </Text>
      </CyberCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CYBER.background },
  content: { padding: 20, paddingBottom: 40 },
  shieldSection: {
    alignItems: "center",
    justifyContent: "center",
    height: 200,
    marginVertical: 10,
  },
  outerRing: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 1,
  },
  middleRing: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  shieldCore: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: CYBER.surface,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 24,
    color: CYBER.text,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: CYBER.textSecondary,
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 10,
    lineHeight: 20,
  },
  statusCard: { marginBottom: 16 },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 6,
  },
  statusLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 4,
  },
  statusLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: CYBER.textSecondary,
  },
  statusValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    letterSpacing: 1,
  },
  mainButton: { alignSelf: "stretch", marginBottom: 24 },
  sectionTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: CYBER.textSecondary,
    letterSpacing: 1,
    marginBottom: 12,
    textTransform: "uppercase",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  indicatorCard: {
    width: "47%",
    gap: 6,
  },
  indicatorLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    lineHeight: 16,
  },
  activeChip: {
    alignSelf: "flex-start",
    borderRadius: 4,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  activeText: { fontFamily: "Inter_700Bold", fontSize: 10, letterSpacing: 0.5 },
  tipCard: {},
  tipRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8, marginTop: 4 },
  tipTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: CYBER.purple },
  tipText: { fontFamily: "Inter_400Regular", fontSize: 13, color: CYBER.textSecondary, lineHeight: 19 },
});
