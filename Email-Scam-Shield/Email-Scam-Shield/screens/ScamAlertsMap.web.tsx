import React, { useState, useRef, useCallback } from "react";
import {
  View, Text, StyleSheet, ScrollView, Animated,
  Dimensions, Modal, TouchableOpacity, FlatList,
  Pressable
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import CyberCard from "@/components/cyber/CyberCard";
import { getScamsByState, ScamAlert, INDIA_STATES } from "@/data/scamData";
import { useProfile } from "@/context/ProfileContext";

const { CYBER } = Colors;
const { width, height } = Dimensions.get("window");
const CARD_WIDTH = width - 64;

const CATEGORY_COLORS: Record<string, string> = {
  Banking: CYBER.red, Phishing: CYBER.yellow, UPI: CYBER.yellow,
  Delivery: CYBER.blue, Employment: CYBER.purple, Tech: CYBER.cyan,
  Investment: CYBER.green, Government: CYBER.red, Identity: CYBER.yellow,
  Insurance: CYBER.blue, Tax: CYBER.purple, Streaming: CYBER.cyan,
  Social: CYBER.purple, Tourism: CYBER.green, Education: CYBER.blue,
  Utility: CYBER.yellow, Lottery: CYBER.red, Impersonation: CYBER.red,
};

const HIGH_ALERT_STATES = ["Delhi", "Maharashtra", "Uttar Pradesh", "Karnataka", "Tamil Nadu", "Andhra Pradesh", "Gujarat", "Telangana"];

function FlashCard({ alert }: { alert: ScamAlert }) {
  const [flipped, setFlipped] = useState(false);
  const flipAnim = useRef(new Animated.Value(0)).current;
  const catColor = CATEGORY_COLORS[alert.category] || CYBER.cyan;

  const handleFlip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.spring(flipAnim, {
      toValue: flipped ? 0 : 1,
      useNativeDriver: true,
      friction: 6,
    }).start(() => setFlipped(!flipped));
  };

  const frontRotate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] });
  const backRotate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ["180deg", "360deg"] });

  return (
    <Pressable onPress={handleFlip} style={[styles.flashcardOuter, { width: CARD_WIDTH }]}>
      <Animated.View style={[styles.flashcard, {
        transform: [{ perspective: 1200 }, { rotateY: frontRotate }],
        borderColor: catColor + "60",
        shadowColor: catColor,
        backfaceVisibility: "hidden",
      }]}>
        <View style={[styles.cardAccent, { backgroundColor: catColor }]} />
        <View style={styles.cardMeta}>
          <View style={[styles.catChip, { backgroundColor: catColor + "20", borderColor: catColor + "50" }]}>
            <Text style={[styles.catText, { color: catColor }]}>{alert.category}</Text>
          </View>
          <Text style={styles.dateText}>{alert.date}</Text>
        </View>
        <Text style={styles.cardTitle}>{alert.title}</Text>
        <View style={styles.msgBox}>
          <Ionicons name="mail-open-outline" size={15} color={CYBER.textSecondary} style={{ marginTop: 2 }} />
          <Text style={styles.msgText}>"{alert.message}"</Text>
        </View>
        <View style={styles.flipHint}>
          <Ionicons name="sync-outline" size={12} color={CYBER.textDim} />
          <Text style={styles.flipHintText}>Tap for prevention tip</Text>
        </View>
      </Animated.View>

      <Animated.View style={[styles.flashcard, styles.flashcardBack, {
        transform: [{ perspective: 1200 }, { rotateY: backRotate }],
        borderColor: CYBER.green + "60",
        shadowColor: CYBER.green,
        backfaceVisibility: "hidden",
      }]}>
        <View style={[styles.cardAccent, { backgroundColor: CYBER.green }]} />
        <View style={styles.tipHeader}>
          <MaterialCommunityIcons name="shield-check" size={26} color={CYBER.green} />
          <Text style={styles.tipHeaderText}>Prevention Tip</Text>
        </View>
        <Text style={styles.tipBody}>{alert.tip}</Text>
        <View style={[styles.backBottom, { borderTopColor: CYBER.green + "30" }]}>
          <Text style={styles.backTitle}>{alert.title}</Text>
        </View>
        <View style={styles.flipHint}>
          <Ionicons name="sync-outline" size={12} color={CYBER.textDim} />
          <Text style={styles.flipHintText}>Tap to go back</Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

export default function ScamAlertsMap() {
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [search, setSearch] = useState("");
  const modalSlide = useRef(new Animated.Value(height)).current;
  const { addStateViewed } = useProfile();
  const [modalVisible, setModalVisible] = useState(false);

  const openState = useCallback((stateName: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addStateViewed(stateName);
    setSelectedState(stateName);
    setActiveIndex(0);
    setModalVisible(true);
    modalSlide.setValue(height);
    Animated.spring(modalSlide, {
      toValue: 0,
      useNativeDriver: true,
      speed: 12,
      bounciness: 4,
    }).start();
  }, []);

  const closeModal = useCallback(() => {
    Animated.timing(modalSlide, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
      setSelectedState(null);
    });
  }, []);

  const alerts = selectedState ? getScamsByState(selectedState) : [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="map-marker-alert" size={22} color={CYBER.cyan} />
        <Text style={styles.headerTitle}>India Scam Alerts</Text>
      </View>
      <Text style={styles.subtitle}>Select any state to view recent scam alerts</Text>

      <View style={styles.alertBanner}>
        <Ionicons name="alert-circle" size={16} color={CYBER.red} />
        <Text style={styles.alertBannerText}>High alert: {HIGH_ALERT_STATES.length} states with 2+ recent scams</Text>
      </View>

      <ScrollView style={styles.stateList} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>STATES & UNION TERRITORIES</Text>
        <View style={styles.stateGrid}>
          {INDIA_STATES.map((state) => {
            const isHigh = HIGH_ALERT_STATES.includes(state);
            const alertCount = getScamsByState(state).length;
            return (
              <Pressable
                key={state}
                onPress={() => openState(state)}
                style={({ pressed }) => [
                  styles.stateCard,
                  {
                    borderColor: isHigh ? CYBER.red + "50" : CYBER.border,
                    backgroundColor: isHigh ? CYBER.red + "08" : CYBER.surface,
                    opacity: pressed ? 0.8 : 1,
                  }
                ]}
              >
                <View style={styles.stateCardTop}>
                  <Text style={styles.stateName}>{state}</Text>
                  <View style={[styles.countChip, {
                    backgroundColor: isHigh ? CYBER.red + "20" : CYBER.cyan + "20",
                    borderColor: isHigh ? CYBER.red + "50" : CYBER.cyan + "30",
                  }]}>
                    <Text style={[styles.countText, { color: isHigh ? CYBER.red : CYBER.cyan }]}>{alertCount}</Text>
                  </View>
                </View>
                {isHigh && (
                  <View style={styles.highAlertRow}>
                    <Ionicons name="warning" size={10} color={CYBER.red} />
                    <Text style={styles.highAlertText}>High Risk</Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>

      <Modal transparent visible={modalVisible} animationType="none" onRequestClose={closeModal}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={closeModal} />
        <Animated.View style={[styles.sheet, { transform: [{ translateY: modalSlide }] }]}>
          <View style={styles.handle} />
          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.sheetSub}>Recent Scam Alerts in</Text>
              <Text style={styles.sheetState}>{selectedState}</Text>
            </View>
            <TouchableOpacity onPress={closeModal} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={CYBER.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.statsBar}>
            <CyberCard glowColor={CYBER.red} padding={10} style={styles.statMini}>
              <Text style={[styles.statNum, { color: CYBER.red }]}>{alerts.length}</Text>
              <Text style={styles.statLbl}>Alerts</Text>
            </CyberCard>
            <CyberCard glowColor={CYBER.yellow} padding={10} style={styles.statMini}>
              <Text style={[styles.statNum, { color: CYBER.yellow }]}>
                {new Set(alerts.map(a => a.category)).size}
              </Text>
              <Text style={styles.statLbl}>Types</Text>
            </CyberCard>
            <CyberCard glowColor={CYBER.cyan} padding={10} style={styles.statMini}>
              <Text style={[styles.statNum, { color: CYBER.cyan }]}>2026</Text>
              <Text style={styles.statLbl}>Year</Text>
            </CyberCard>
          </View>

          <Text style={styles.swipeHint}>Swipe left/right • Tap card to flip for prevention tip</Text>

          <FlatList
            data={alerts}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.carousel}
            onMomentumScrollEnd={(e) => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / CARD_WIDTH);
              setActiveIndex(idx);
            }}
            renderItem={({ item }) => <FlashCard alert={item} />}
          />

          <View style={styles.dots}>
            {alerts.map((_, i) => (
              <View key={i} style={[styles.dot, {
                backgroundColor: i === activeIndex ? CYBER.cyan : CYBER.border,
                width: i === activeIndex ? 16 : 6,
              }]} />
            ))}
          </View>
        </Animated.View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CYBER.background, paddingTop: 67 },
  header: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingBottom: 4 },
  headerTitle: { fontFamily: "Inter_700Bold", fontSize: 18, color: CYBER.text },
  subtitle: { fontFamily: "Inter_400Regular", fontSize: 12, color: CYBER.textSecondary, paddingHorizontal: 16, marginBottom: 8 },
  alertBanner: {
    flexDirection: "row", alignItems: "center", gap: 8,
    marginHorizontal: 16, marginBottom: 12,
    backgroundColor: CYBER.red + "12", borderRadius: 8,
    borderWidth: 1, borderColor: CYBER.red + "30",
    padding: 10,
  },
  alertBannerText: { fontFamily: "Inter_500Medium", fontSize: 12, color: CYBER.red, flex: 1 },
  stateList: { flex: 1 },
  sectionLabel: { fontFamily: "Inter_700Bold", fontSize: 11, color: CYBER.textDim, letterSpacing: 1.5, paddingHorizontal: 16, marginBottom: 10 },
  stateGrid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 12, gap: 8 },
  stateCard: {
    width: (width - 40) / 2,
    borderRadius: 10, borderWidth: 1,
    padding: 12,
  },
  stateCardTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  stateName: { fontFamily: "Inter_500Medium", fontSize: 12, color: CYBER.text, flex: 1, marginRight: 6 },
  countChip: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 6, paddingVertical: 2, minWidth: 22, alignItems: "center" },
  countText: { fontFamily: "Inter_700Bold", fontSize: 11 },
  highAlertRow: { flexDirection: "row", alignItems: "center", gap: 3, marginTop: 4 },
  highAlertText: { fontFamily: "Inter_700Bold", fontSize: 10, color: CYBER.red, letterSpacing: 0.5 },
  backdrop: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)" },
  sheet: {
    position: "absolute",
    bottom: 0, left: 0, right: 0,
    backgroundColor: CYBER.surface,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    borderTopWidth: 1, borderTopColor: CYBER.cyan + "40",
    paddingBottom: 34,
    maxHeight: height * 0.78,
    shadowColor: CYBER.cyan, shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2, shadowRadius: 16, elevation: 20,
  },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: CYBER.textDim, alignSelf: "center", marginTop: 12, marginBottom: 4 },
  sheetHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: CYBER.border,
  },
  sheetSub: { fontFamily: "Inter_400Regular", fontSize: 12, color: CYBER.textSecondary },
  sheetState: { fontFamily: "Inter_700Bold", fontSize: 20, color: CYBER.cyan },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: CYBER.background, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: CYBER.border },
  statsBar: { flexDirection: "row", gap: 10, padding: 14, paddingBottom: 6 },
  statMini: { flex: 1, alignItems: "center" },
  statNum: { fontFamily: "Inter_700Bold", fontSize: 20 },
  statLbl: { fontFamily: "Inter_400Regular", fontSize: 11, color: CYBER.textSecondary },
  swipeHint: { fontFamily: "Inter_400Regular", fontSize: 11, color: CYBER.textDim, textAlign: "center", marginBottom: 10 },
  carousel: { paddingHorizontal: 16, gap: 12 },
  flashcardOuter: { height: 220, position: "relative" },
  flashcard: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: 16, borderWidth: 1,
    backgroundColor: CYBER.background,
    padding: 14, overflow: "hidden",
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5,
  },
  flashcardBack: {},
  cardAccent: { position: "absolute", top: 0, left: 14, right: 14, height: 2, borderBottomLeftRadius: 2, borderBottomRightRadius: 2 },
  cardMeta: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 12, marginBottom: 8 },
  catChip: { borderRadius: 5, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3 },
  catText: { fontFamily: "Inter_700Bold", fontSize: 10, letterSpacing: 0.5 },
  dateText: { fontFamily: "Inter_400Regular", fontSize: 11, color: CYBER.textDim },
  cardTitle: { fontFamily: "Inter_700Bold", fontSize: 15, color: CYBER.text, marginBottom: 8 },
  msgBox: { flexDirection: "row", gap: 8, backgroundColor: CYBER.surface, borderRadius: 8, padding: 8, borderWidth: 1, borderColor: CYBER.border, flex: 1 },
  msgText: { fontFamily: "Inter_400Regular", fontSize: 12, color: CYBER.textSecondary, lineHeight: 17, flex: 1 },
  flipHint: { flexDirection: "row", alignItems: "center", gap: 4, alignSelf: "flex-end", marginTop: 6 },
  flipHintText: { fontFamily: "Inter_400Regular", fontSize: 10, color: CYBER.textDim },
  tipHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 12, marginBottom: 10 },
  tipHeaderText: { fontFamily: "Inter_700Bold", fontSize: 17, color: CYBER.green },
  tipBody: { fontFamily: "Inter_400Regular", fontSize: 13, color: CYBER.text, lineHeight: 20, flex: 1 },
  backBottom: { borderTopWidth: 1, paddingTop: 8, marginTop: 6 },
  backTitle: { fontFamily: "Inter_600SemiBold", fontSize: 12, color: CYBER.textSecondary },
  dots: { flexDirection: "row", justifyContent: "center", gap: 6, paddingTop: 10 },
  dot: { height: 6, borderRadius: 3, backgroundColor: CYBER.border },
});
