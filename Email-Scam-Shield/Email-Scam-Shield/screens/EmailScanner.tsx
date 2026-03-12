import React, { useState, useRef } from "react";
import {
  View, Text, StyleSheet, TextInput, ScrollView, Animated,
  Keyboard, TouchableWithoutFeedback
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import GlowButton from "@/components/cyber/GlowButton";
import CyberCard from "@/components/cyber/CyberCard";
import RiskMeter from "@/components/cyber/RiskMeter";
import { scanEmail, ScanResult } from "@/services/scanService";
import { useProfile } from "@/context/ProfileContext";

const { CYBER } = Colors;

const SAMPLE_EMAILS = [
  `From: support@paypaI.com\nSubject: URGENT: Account Limited\n\nDear Customer,\nYour PayPal account has been limited due to suspicious activity.\nClick here immediately to restore access: http://secure-paypal-verify.xyz/login\nFailure to verify within 24 hours will result in permanent suspension.`,
  `From: no-reply@amazon.in\nSubject: Your order has been shipped!\n\nHi there,\nYour Amazon order #OTR-9823417 has been shipped and is on its way.\nEstimated delivery: March 12, 2026\nTrack your package in the Amazon app.`,
  `From: alerts@hdfc-secure.ru\nSubject: Verify KYC Immediately\n\nDear Valued Customer,\nYour HDFC Bank KYC is expired. Account will be SUSPENDED in 24 hours.\nUpdate KYC immediately: http://hdfc-kyc-update.xyz\nShare your OTP received on mobile to complete verification.`,
];

export default function EmailScanner() {
  const [emailText, setEmailText] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const { incrementScans } = useProfile();
  const slideAnim = useRef(new Animated.Value(50)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  const handleScan = () => {
    if (!emailText.trim()) return;
    Keyboard.dismiss();
    setIsScanning(true);
    setResult(null);

    Animated.loop(
      Animated.timing(scanLineAnim, { toValue: 1, duration: 600, useNativeDriver: false }),
      { iterations: 3 }
    ).start(() => {
      setIsScanning(false);
      const scanResult = scanEmail(emailText);
      setResult(scanResult);
      incrementScans(scanResult.riskLevel !== "safe");

      slideAnim.setValue(50);
      opacityAnim.setValue(0);
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, speed: 12 }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
    });
  };

  const handleClear = () => {
    setEmailText("");
    setResult(null);
  };

  const scanLineColor = scanLineAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [CYBER.cyan + "00", CYBER.cyan, CYBER.cyan + "00"],
  });

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Ionicons name="scan" size={28} color={CYBER.cyan} />
          <Text style={styles.title}>Email Scanner</Text>
        </View>
        <Text style={styles.subtitle}>Paste any email text below to detect phishing and scam patterns</Text>

        <View style={styles.inputWrapper}>
          <Animated.View style={[styles.scanLine, { backgroundColor: scanLineColor }]} />
          <TextInput
            style={styles.input}
            placeholder="Paste email content here — subject, body, links, sender info..."
            placeholderTextColor={CYBER.textDim}
            multiline
            value={emailText}
            onChangeText={setEmailText}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.sampleRow}>
          <Text style={styles.sampleLabel}>Try a sample:</Text>
          {SAMPLE_EMAILS.map((_, i) => (
            <GlowButton
              key={i}
              label={`#${i + 1}`}
              onPress={() => setEmailText(SAMPLE_EMAILS[i])}
              color={i === 0 ? CYBER.red : i === 1 ? CYBER.green : CYBER.yellow}
              size="sm"
              variant="outline"
            />
          ))}
        </View>

        <View style={styles.buttonRow}>
          <GlowButton
            label={isScanning ? "Scanning..." : "Scan Email"}
            onPress={handleScan}
            color={CYBER.cyan}
            textColor={CYBER.background}
            size="lg"
            disabled={isScanning || !emailText.trim()}
            style={styles.scanButton}
          />
          {emailText ? (
            <GlowButton
              label="Clear"
              onPress={handleClear}
              color={CYBER.textDim}
              size="lg"
              variant="outline"
            />
          ) : null}
        </View>

        {result && (
          <Animated.View style={[
            styles.resultContainer,
            { opacity: opacityAnim, transform: [{ translateY: slideAnim }] }
          ]}>
            <Text style={styles.sectionTitle}>Scan Result</Text>
            <RiskMeter level={result.riskLevel} score={result.riskScore} />

            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Detection Report</Text>
            {result.reasons.map((reason, i) => (
              <CyberCard
                key={i}
                glowColor={result.riskLevel === "high" ? CYBER.red : result.riskLevel === "suspicious" ? CYBER.yellow : CYBER.green}
                padding={12}
                style={styles.reasonCard}
              >
                <View style={styles.reasonRow}>
                  <Ionicons
                    name={result.riskLevel === "high" ? "warning" : result.riskLevel === "suspicious" ? "alert-circle" : "checkmark-circle"}
                    size={18}
                    color={result.riskLevel === "high" ? CYBER.red : result.riskLevel === "suspicious" ? CYBER.yellow : CYBER.green}
                  />
                  <Text style={styles.reasonText}>{reason}</Text>
                </View>
              </CyberCard>
            ))}

            <CyberCard glowColor={CYBER.purple} style={styles.tipCard}>
              <View style={styles.tipRow}>
                <Ionicons name="shield-checkmark" size={18} color={CYBER.purple} />
                <Text style={styles.tipTitle}>Safety Tip</Text>
              </View>
              <Text style={styles.tipText}>{result.tip}</Text>
            </CyberCard>
          </Animated.View>
        )}
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CYBER.background },
  content: { padding: 20, paddingBottom: 60 },
  header: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  title: { fontFamily: "Inter_700Bold", fontSize: 24, color: CYBER.text },
  subtitle: {
    fontFamily: "Inter_400Regular", fontSize: 14,
    color: CYBER.textSecondary, marginBottom: 20, lineHeight: 20
  },
  inputWrapper: {
    backgroundColor: CYBER.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: CYBER.border,
    overflow: "hidden",
    marginBottom: 14,
    position: "relative",
  },
  scanLine: {
    position: "absolute",
    top: 0, left: 0, right: 0,
    height: 2,
    zIndex: 10,
  },
  input: {
    padding: 16,
    fontSize: 14,
    color: CYBER.text,
    fontFamily: "Inter_400Regular",
    minHeight: 160,
    lineHeight: 22,
  },
  sampleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
    flexWrap: "wrap",
  },
  sampleLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: CYBER.textSecondary,
  },
  buttonRow: { flexDirection: "row", gap: 10, marginBottom: 24 },
  scanButton: { flex: 1 },
  resultContainer: { gap: 0 },
  sectionTitle: {
    fontFamily: "Inter_600SemiBold", fontSize: 13,
    color: CYBER.textSecondary, letterSpacing: 1,
    textTransform: "uppercase", marginBottom: 10,
  },
  reasonCard: { marginBottom: 8 },
  reasonRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, paddingTop: 4 },
  reasonText: {
    fontFamily: "Inter_400Regular", fontSize: 13,
    color: CYBER.text, flex: 1, lineHeight: 18,
  },
  tipCard: { marginTop: 16 },
  tipRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8, marginTop: 4 },
  tipTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: CYBER.purple },
  tipText: {
    fontFamily: "Inter_400Regular", fontSize: 13,
    color: CYBER.textSecondary, lineHeight: 19,
  },
});
