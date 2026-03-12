import React, { useRef, useEffect } from "react";
import {
  View, Text, StyleSheet, ScrollView, Animated
} from "react-native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import CyberCard from "@/components/cyber/CyberCard";
import { useProfile } from "@/context/ProfileContext";
import { AVATARS, getRank } from "@/data/gameData";

const { CYBER } = Colors;

export default function ProfileDashboard() {
  const { profile } = useProfile();
  const avatar = AVATARS.find(a => a.id === profile.selectedAvatar) || AVATARS[0];
  const { rank, color: rankColor } = getRank(profile.gameScore);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scanAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.06, duration: 2000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.timing(scanAnim, { toValue: 1, duration: 3000, useNativeDriver: true })
    ).start();
  }, []);

  const scanTranslate = scanAnim.interpolate({ inputRange: [0, 1], outputRange: [-10, 120] });

  const earnedBadges = profile.badges.filter(b => b.earned);
  const unearnedBadges = profile.badges.filter(b => !b.earned);

  const stats = [
    { icon: "email-check", label: "Emails Scanned", value: profile.emailsScanned, color: CYBER.cyan },
    { icon: "alert-octagon", label: "Scams Detected", value: profile.scamsDetected, color: CYBER.red },
    { icon: "gamepad-variant", label: "Best Score", value: `${profile.gameScore}%`, color: CYBER.purple },
    { icon: "trophy", label: "Levels Done", value: profile.levelsCompleted, color: CYBER.yellow },
    { icon: "shield-check", label: "Protection", value: profile.protectionEnabled ? "ON" : "OFF", color: profile.protectionEnabled ? CYBER.green : CYBER.textDim },
    { icon: "star-circle", label: "Badges Earned", value: earnedBadges.length, color: CYBER.blue },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.avatarSection}>
        <Animated.View style={[styles.avatarRing, {
          transform: [{ scale: pulseAnim }],
          borderColor: avatar.color + "60",
        }]}>
          <View style={styles.avatarScanLine}>
            <Animated.View style={[styles.scanLine, {
              transform: [{ translateY: scanTranslate }],
              backgroundColor: avatar.color + "60",
            }]} />
          </View>
          <Text style={styles.avatarEmoji}>{avatar.emoji}</Text>
        </Animated.View>
        <Text style={[styles.avatarName, { color: avatar.color }]}>{avatar.name}</Text>
        <View style={[styles.rankBadge, { backgroundColor: rankColor + "20", borderColor: rankColor + "50" }]}>
          <Text style={[styles.rankText, { color: rankColor }]}>{rank}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Cyber Stats</Text>
      <View style={styles.statsGrid}>
        {stats.map((stat, i) => (
          <CyberCard key={i} glowColor={stat.color} padding={14} style={styles.statCard}>
            <MaterialCommunityIcons name={stat.icon as any} size={24} color={stat.color} />
            <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </CyberCard>
        ))}
      </View>

      {earnedBadges.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Earned Badges</Text>
          <View style={styles.badgeGrid}>
            {earnedBadges.map((badge) => (
              <CyberCard key={badge.id} glowColor={CYBER.cyan} padding={14} style={styles.badgeCard}>
                <Text style={styles.badgeIcon}>{badge.icon}</Text>
                <Text style={styles.badgeName}>{badge.name}</Text>
                <Text style={styles.badgeDesc}>{badge.description}</Text>
                {badge.earnedDate && (
                  <Text style={styles.badgeDate}>{badge.earnedDate}</Text>
                )}
                <View style={[styles.earnedBadge, { backgroundColor: CYBER.cyan + "20", borderColor: CYBER.cyan + "60" }]}>
                  <Ionicons name="checkmark-circle" size={12} color={CYBER.cyan} />
                  <Text style={styles.earnedText}>EARNED</Text>
                </View>
              </CyberCard>
            ))}
          </View>
        </>
      )}

      {unearnedBadges.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Locked Badges</Text>
          <View style={styles.badgeGrid}>
            {unearnedBadges.map((badge) => (
              <CyberCard key={badge.id} glowColor={CYBER.textDim} padding={14} style={styles.badgeCard}>
                <Text style={[styles.badgeIcon, { opacity: 0.4 }]}>{badge.icon}</Text>
                <Text style={[styles.badgeName, { color: CYBER.textDim }]}>{badge.name}</Text>
                <Text style={styles.badgeDesc}>{badge.description}</Text>
                <View style={[styles.earnedBadge, { backgroundColor: CYBER.textDim + "20", borderColor: CYBER.textDim + "40" }]}>
                  <Ionicons name="lock-closed" size={12} color={CYBER.textDim} />
                  <Text style={[styles.earnedText, { color: CYBER.textDim }]}>LOCKED</Text>
                </View>
              </CyberCard>
            ))}
          </View>
        </>
      )}

      <CyberCard glowColor={CYBER.blue} style={styles.tipCard}>
        <View style={styles.tipRow}>
          <MaterialCommunityIcons name="robot" size={20} color={CYBER.blue} />
          <Text style={styles.tipTitle}>Mission Status</Text>
        </View>
        <Text style={styles.tipText}>
          Complete more scans and game levels to earn badges and improve your rank.
          Reach "Cyber Defender" status by scoring 90%+ in the runner game!
        </Text>
      </CyberCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CYBER.background },
  content: { padding: 20, paddingBottom: 60 },
  avatarSection: {
    alignItems: "center",
    marginBottom: 28,
    marginTop: 10,
  },
  avatarRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: CYBER.surface,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
    overflow: "hidden",
  },
  avatarScanLine: {
    position: "absolute",
    top: 0, left: 0, right: 0,
    height: 120,
    overflow: "hidden",
  },
  scanLine: {
    height: 2,
    width: "100%",
  },
  avatarEmoji: { fontSize: 60 },
  avatarName: { fontFamily: "Inter_700Bold", fontSize: 20, marginBottom: 8 },
  rankBadge: {
    borderRadius: 20, borderWidth: 1,
    paddingHorizontal: 16, paddingVertical: 6,
  },
  rankText: { fontFamily: "Inter_700Bold", fontSize: 14, letterSpacing: 1 },
  sectionTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: CYBER.textSecondary,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 12,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 24,
  },
  statCard: { width: "47%", alignItems: "center", gap: 6 },
  statValue: { fontFamily: "Inter_700Bold", fontSize: 24 },
  statLabel: { fontFamily: "Inter_400Regular", fontSize: 12, color: CYBER.textSecondary, textAlign: "center" },
  badgeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 24 },
  badgeCard: { width: "47%", alignItems: "center", gap: 5 },
  badgeIcon: { fontSize: 32 },
  badgeName: { fontFamily: "Inter_700Bold", fontSize: 13, color: CYBER.text, textAlign: "center" },
  badgeDesc: { fontFamily: "Inter_400Regular", fontSize: 11, color: CYBER.textSecondary, textAlign: "center", lineHeight: 15 },
  badgeDate: { fontFamily: "Inter_400Regular", fontSize: 11, color: CYBER.textDim },
  earnedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 4,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 3,
    marginTop: 2,
  },
  earnedText: { fontFamily: "Inter_700Bold", fontSize: 10, color: CYBER.cyan, letterSpacing: 0.5 },
  tipCard: { marginBottom: 10 },
  tipRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8, marginTop: 4 },
  tipTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: CYBER.blue },
  tipText: { fontFamily: "Inter_400Regular", fontSize: 13, color: CYBER.textSecondary, lineHeight: 19 },
});
