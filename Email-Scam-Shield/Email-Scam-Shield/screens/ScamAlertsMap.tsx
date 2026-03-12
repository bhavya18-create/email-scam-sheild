import React, { useState, useRef, useCallback } from "react";
import {
  View, Text, StyleSheet, ScrollView, Animated,
  Dimensions, Modal, TouchableOpacity, FlatList, Platform,
  Pressable
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import CyberCard from "@/components/cyber/CyberCard";
import GlowButton from "@/components/cyber/GlowButton";
import { getScamsByState, ScamAlert } from "@/data/scamData";
import { useProfile } from "@/context/ProfileContext";

const { CYBER } = Colors;
const { width, height } = Dimensions.get("window");
const CARD_WIDTH = width - 64;

interface StateMarker {
  state: string;
  lat: number;
  lng: number;
  alertCount: number;
}

const STATE_MARKERS: StateMarker[] = [
  { state: "Andhra Pradesh", lat: 15.9129, lng: 79.7400, alertCount: 2 },
  { state: "Arunachal Pradesh", lat: 27.0844, lng: 93.6053, alertCount: 1 },
  { state: "Assam", lat: 26.2006, lng: 92.9376, alertCount: 1 },
  { state: "Bihar", lat: 25.0961, lng: 85.3131, alertCount: 1 },
  { state: "Chhattisgarh", lat: 21.2787, lng: 81.8661, alertCount: 1 },
  { state: "Goa", lat: 15.2993, lng: 74.1240, alertCount: 1 },
  { state: "Gujarat", lat: 22.2587, lng: 71.1924, alertCount: 2 },
  { state: "Haryana", lat: 29.0588, lng: 76.0856, alertCount: 1 },
  { state: "Himachal Pradesh", lat: 31.1048, lng: 77.1734, alertCount: 1 },
  { state: "Jharkhand", lat: 23.6102, lng: 85.2799, alertCount: 1 },
  { state: "Karnataka", lat: 15.3173, lng: 75.7139, alertCount: 2 },
  { state: "Kerala", lat: 10.8505, lng: 76.2711, alertCount: 1 },
  { state: "Madhya Pradesh", lat: 22.9734, lng: 78.6569, alertCount: 1 },
  { state: "Maharashtra", lat: 19.7515, lng: 75.7139, alertCount: 2 },
  { state: "Manipur", lat: 24.6637, lng: 93.9063, alertCount: 1 },
  { state: "Meghalaya", lat: 25.4670, lng: 91.3662, alertCount: 1 },
  { state: "Mizoram", lat: 23.1645, lng: 92.9376, alertCount: 1 },
  { state: "Nagaland", lat: 26.1584, lng: 94.5624, alertCount: 1 },
  { state: "Odisha", lat: 20.9517, lng: 85.0985, alertCount: 1 },
  { state: "Punjab", lat: 31.1471, lng: 75.3412, alertCount: 1 },
  { state: "Rajasthan", lat: 27.0238, lng: 74.2179, alertCount: 1 },
  { state: "Sikkim", lat: 27.5330, lng: 88.5122, alertCount: 1 },
  { state: "Tamil Nadu", lat: 11.1271, lng: 78.6569, alertCount: 2 },
  { state: "Telangana", lat: 17.1232, lng: 79.2088, alertCount: 1 },
  { state: "Tripura", lat: 23.9408, lng: 91.9882, alertCount: 1 },
  { state: "Uttar Pradesh", lat: 26.8467, lng: 80.9462, alertCount: 2 },
  { state: "Uttarakhand", lat: 30.0668, lng: 79.0193, alertCount: 1 },
  { state: "West Bengal", lat: 22.9868, lng: 87.8550, alertCount: 1 },
  { state: "Delhi", lat: 28.7041, lng: 77.1025, alertCount: 2 },
  { state: "Jammu & Kashmir", lat: 33.7782, lng: 76.5762, alertCount: 1 },
];

const INDIA_REGION = {
  latitude: 20.5937,
  longitude: 78.9629,
  latitudeDelta: 30,
  longitudeDelta: 26,
};

const DARK_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#0f172a" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0f172a" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#1e3a5f" }] },
  { featureType: "administrative.country", elementType: "geometry.stroke", stylers: [{ color: "#22d3ee" }, { weight: 1.5 }] },
  { featureType: "administrative.province", elementType: "geometry.stroke", stylers: [{ color: "#1e3a5f" }, { weight: 0.8 }] },
  { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#1e293b" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#1e293b" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#475569" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#263348" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#1a2a40" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#475569" }] },
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#1e293b" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0a1628" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#22d3ee" }] },
];

const CATEGORY_COLORS: Record<string, string> = {
  Banking: CYBER.red, Phishing: CYBER.yellow, UPI: CYBER.yellow,
  Delivery: CYBER.blue, Employment: CYBER.purple, Tech: CYBER.cyan,
  Investment: CYBER.green, Government: CYBER.red, Identity: CYBER.yellow,
  Insurance: CYBER.blue, Tax: CYBER.purple, Streaming: CYBER.cyan,
  Social: CYBER.purple, Tourism: CYBER.green, Education: CYBER.blue,
  Utility: CYBER.yellow, Lottery: CYBER.red, Impersonation: CYBER.red,
};

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
  const [modalVisible, setModalVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const modalSlide = useRef(new Animated.Value(height)).current;
  const { addStateViewed } = useProfile();

  const openStateAlerts = useCallback((stateName: string) => {
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

  const markerColor = (count: number) =>
    count >= 3 ? CYBER.red : count >= 2 ? CYBER.yellow : CYBER.cyan;

  return (
    <View style={styles.container}>
      <View style={styles.mapHeader}>
        <MaterialCommunityIcons name="map-marker-alert" size={22} color={CYBER.cyan} />
        <Text style={styles.mapHeaderTitle}>India Scam Alerts Map</Text>
      </View>
      <Text style={styles.mapSubtitle}>Tap any marker to view recent scam alerts for that state</Text>

      <MapView
        style={styles.map}
        initialRegion={INDIA_REGION}
        customMapStyle={Platform.OS !== "web" ? DARK_MAP_STYLE : undefined}
        showsUserLocation={false}
        showsCompass={false}
        showsScale={false}
        toolbarEnabled={false}
      >
        {STATE_MARKERS.map((marker) => (
          <Marker
            key={marker.state}
            coordinate={{ latitude: marker.lat, longitude: marker.lng }}
            onPress={() => openStateAlerts(marker.state)}
            title={marker.state}
            description={`${marker.alertCount} scam alert${marker.alertCount > 1 ? "s" : ""}`}
          >
            <View style={styles.markerContainer}>
              <View style={[styles.markerBubble, {
                backgroundColor: markerColor(marker.alertCount),
                shadowColor: markerColor(marker.alertCount),
              }]}>
                <Ionicons name="alert" size={10} color={CYBER.background} />
              </View>
              <View style={[styles.markerStem, { backgroundColor: markerColor(marker.alertCount) }]} />
              <Text style={[styles.markerCount, { color: markerColor(marker.alertCount) }]}>
                {marker.alertCount}
              </Text>
            </View>
          </Marker>
        ))}
      </MapView>

      <View style={styles.legendRow}>
        {[
          { color: CYBER.cyan, label: "1 alert" },
          { color: CYBER.yellow, label: "2 alerts" },
          { color: CYBER.red, label: "3+ alerts" },
        ].map((item) => (
          <View key={item.label} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: item.color }]} />
            <Text style={styles.legendText}>{item.label}</Text>
          </View>
        ))}
        <Text style={styles.legendTotal}>{STATE_MARKERS.length} states monitored</Text>
      </View>

      <Modal transparent visible={modalVisible} animationType="none" onRequestClose={closeModal}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={closeModal} />
        <Animated.View style={[styles.bottomSheet, { transform: [{ translateY: modalSlide }] }]}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.sheetSubheading}>Recent Scam Alerts in</Text>
              <Text style={styles.sheetState}>{selectedState}</Text>
            </View>
            <TouchableOpacity onPress={closeModal} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={CYBER.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.statsBar}>
            <CyberCard glowColor={CYBER.red} padding={10} style={styles.statMini}>
              <Text style={[styles.statMiniNum, { color: CYBER.red }]}>{alerts.length}</Text>
              <Text style={styles.statMiniLbl}>Alerts</Text>
            </CyberCard>
            <CyberCard glowColor={CYBER.yellow} padding={10} style={styles.statMini}>
              <Text style={[styles.statMiniNum, { color: CYBER.yellow }]}>
                {new Set(alerts.map(a => a.category)).size}
              </Text>
              <Text style={styles.statMiniLbl}>Types</Text>
            </CyberCard>
            <CyberCard glowColor={CYBER.cyan} padding={10} style={styles.statMini}>
              <Text style={[styles.statMiniNum, { color: CYBER.cyan }]}>2026</Text>
              <Text style={styles.statMiniLbl}>Year</Text>
            </CyberCard>
          </View>

          <Text style={styles.swipeHint}>Swipe cards left/right • Tap card to see prevention tip</Text>

          <FlatList
            data={alerts}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.carouselContent}
            onMomentumScrollEnd={(e) => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / CARD_WIDTH);
              setActiveIndex(idx);
            }}
            renderItem={({ item }) => <FlashCard alert={item} />}
          />

          <View style={styles.dotRow}>
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
  container: { flex: 1, backgroundColor: CYBER.background },
  mapHeader: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4,
  },
  mapHeaderTitle: { fontFamily: "Inter_700Bold", fontSize: 18, color: CYBER.text },
  mapSubtitle: {
    fontFamily: "Inter_400Regular", fontSize: 12,
    color: CYBER.textSecondary, paddingHorizontal: 16, marginBottom: 8,
  },
  map: { flex: 1 },
  markerContainer: { alignItems: "center" },
  markerBubble: {
    width: 22, height: 22, borderRadius: 11,
    alignItems: "center", justifyContent: "center",
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.9, shadowRadius: 6, elevation: 6,
  },
  markerStem: { width: 2, height: 6 },
  markerCount: { fontFamily: "Inter_700Bold", fontSize: 9, marginTop: -2 },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: CYBER.surface,
    borderTopWidth: 1,
    borderTopColor: CYBER.border,
    gap: 12,
    flexWrap: "wrap",
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontFamily: "Inter_400Regular", fontSize: 11, color: CYBER.textSecondary },
  legendTotal: { fontFamily: "Inter_500Medium", fontSize: 11, color: CYBER.textDim, marginLeft: "auto" },

  modalBackdrop: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  bottomSheet: {
    position: "absolute",
    bottom: 0, left: 0, right: 0,
    backgroundColor: CYBER.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderTopColor: CYBER.cyan + "40",
    paddingBottom: Platform.OS === "web" ? 34 : 30,
    maxHeight: height * 0.75,
    shadowColor: CYBER.cyan,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 20,
  },
  sheetHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: CYBER.textDim,
    alignSelf: "center",
    marginTop: 12, marginBottom: 4,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: CYBER.border,
  },
  sheetSubheading: { fontFamily: "Inter_400Regular", fontSize: 12, color: CYBER.textSecondary },
  sheetState: { fontFamily: "Inter_700Bold", fontSize: 20, color: CYBER.cyan },
  closeBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: CYBER.background,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: CYBER.border,
  },
  statsBar: { flexDirection: "row", gap: 10, padding: 14, paddingBottom: 6 },
  statMini: { flex: 1, alignItems: "center" },
  statMiniNum: { fontFamily: "Inter_700Bold", fontSize: 20 },
  statMiniLbl: { fontFamily: "Inter_400Regular", fontSize: 11, color: CYBER.textSecondary },
  swipeHint: {
    fontFamily: "Inter_400Regular", fontSize: 11,
    color: CYBER.textDim, textAlign: "center", marginBottom: 10,
  },
  carouselContent: { paddingHorizontal: 16, gap: 12 },
  flashcardOuter: { height: 220, position: "relative" },
  flashcard: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: 16, borderWidth: 1,
    backgroundColor: CYBER.background,
    padding: 14, overflow: "hidden",
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5,
  },
  flashcardBack: {},
  cardAccent: {
    position: "absolute", top: 0, left: 14, right: 14,
    height: 2, borderBottomLeftRadius: 2, borderBottomRightRadius: 2,
  },
  cardMeta: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 12, marginBottom: 8 },
  catChip: { borderRadius: 5, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3 },
  catText: { fontFamily: "Inter_700Bold", fontSize: 10, letterSpacing: 0.5 },
  dateText: { fontFamily: "Inter_400Regular", fontSize: 11, color: CYBER.textDim },
  cardTitle: { fontFamily: "Inter_700Bold", fontSize: 15, color: CYBER.text, marginBottom: 8 },
  msgBox: {
    flexDirection: "row", gap: 8,
    backgroundColor: CYBER.surface, borderRadius: 8, padding: 8,
    borderWidth: 1, borderColor: CYBER.border, flex: 1,
  },
  msgText: { fontFamily: "Inter_400Regular", fontSize: 12, color: CYBER.textSecondary, lineHeight: 17, flex: 1 },
  flipHint: { flexDirection: "row", alignItems: "center", gap: 4, alignSelf: "flex-end", marginTop: 6 },
  flipHintText: { fontFamily: "Inter_400Regular", fontSize: 10, color: CYBER.textDim },
  tipHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 12, marginBottom: 10 },
  tipHeaderText: { fontFamily: "Inter_700Bold", fontSize: 17, color: CYBER.green },
  tipBody: { fontFamily: "Inter_400Regular", fontSize: 13, color: CYBER.text, lineHeight: 20, flex: 1 },
  backBottom: { borderTopWidth: 1, paddingTop: 8, marginTop: 6 },
  backTitle: { fontFamily: "Inter_600SemiBold", fontSize: 12, color: CYBER.textSecondary },
  dotRow: { flexDirection: "row", justifyContent: "center", gap: 6, paddingTop: 10 },
  dot: { height: 6, borderRadius: 3, backgroundColor: CYBER.border },
});
