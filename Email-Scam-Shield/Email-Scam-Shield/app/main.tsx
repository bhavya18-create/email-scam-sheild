import React, { useRef, useState, useCallback } from "react";
import {
  View, Text, StyleSheet, Animated, Dimensions,
  ScrollView, Platform, TouchableOpacity
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import ProtectionDashboard from "@/screens/ProtectionDashboard";
import EmailScanner from "@/screens/EmailScanner";
import ScamAlertsMap from "@/screens/ScamAlertsMap";
import CyberRunnerGame from "@/screens/CyberRunnerGame";
import ProfileDashboard from "@/screens/ProfileDashboard";

const { CYBER } = Colors;
const { width } = Dimensions.get("window");

const TABS = [
  { id: 0, label: "Shield", icon: "shield-checkmark-outline", activeIcon: "shield-checkmark", color: CYBER.cyan },
  { id: 1, label: "Scanner", icon: "scan-outline", activeIcon: "scan", color: CYBER.blue },
  { id: 2, label: "Alerts", icon: "alert-circle-outline", activeIcon: "alert-circle", color: CYBER.red },
  { id: 3, label: "Game", icon: "game-controller-outline", activeIcon: "game-controller", color: CYBER.purple },
  { id: 4, label: "Profile", icon: "person-circle-outline", activeIcon: "person-circle", color: CYBER.yellow },
] as const;

const SCREEN_TITLES = [
  "Protection Shield",
  "Email Scanner",
  "Scam Alerts",
  "Cyber Runner",
  "Profile",
];

export default function MainDashboard() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const indicatorAnim = useRef(new Animated.Value(0)).current;

  const TAB_BAR_HEIGHT = 64;
  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom;

  const handleTabPress = useCallback((index: number) => {
    scrollRef.current?.scrollTo({ x: index * width, animated: true });
    setActiveTab(index);
    Animated.spring(indicatorAnim, {
      toValue: index * (width / 5),
      useNativeDriver: true,
      speed: 20,
      bounciness: 4,
    }).start();
  }, [width]);

  const handleScroll = useCallback((e: any) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const newPage = Math.round(offsetX / width);
    if (newPage !== activeTab && newPage >= 0 && newPage < 5) {
      setActiveTab(newPage);
      Animated.spring(indicatorAnim, {
        toValue: newPage * (width / 5),
        useNativeDriver: true,
        speed: 20,
        bounciness: 4,
      }).start();
    }
  }, [activeTab, width]);

  const activeColor = TABS[activeTab].color;

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      <View style={[styles.header, { borderBottomColor: activeColor + "30" }]}>
        <View style={styles.headerLeft}>
          <MaterialCommunityIcons name="shield" size={22} color={activeColor} />
          <Text style={[styles.headerTitle, { color: activeColor }]}>
            {SCREEN_TITLES[activeTab]}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <View style={[styles.liveBadge, { backgroundColor: activeColor + "15", borderColor: activeColor + "40" }]}>
            <View style={[styles.liveDot, { backgroundColor: activeColor }]} />
            <Text style={[styles.liveText, { color: activeColor }]}>LIVE</Text>
          </View>
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onMomentumScrollEnd={handleScroll}
        style={styles.pager}
        bounces={false}
        decelerationRate="fast"
      >
        <View style={[styles.page, { width }]}>
          <ProtectionDashboard />
        </View>
        <View style={[styles.page, { width }]}>
          <EmailScanner />
        </View>
        <View style={[styles.page, { width }]}>
          <ScamAlertsMap />
        </View>
        <View style={[styles.page, { width }]}>
          <CyberRunnerGame />
        </View>
        <View style={[styles.page, { width }]}>
          <ProfileDashboard />
        </View>
      </ScrollView>

      <View style={[styles.tabBar, {
        height: TAB_BAR_HEIGHT + bottomPadding,
        paddingBottom: bottomPadding,
        borderTopColor: CYBER.border,
      }]}>
        <Animated.View style={[styles.tabIndicator, {
          transform: [{ translateX: indicatorAnim }],
          backgroundColor: TABS[activeTab].color + "20",
          borderTopColor: TABS[activeTab].color,
          width: width / 5,
        }]} />

        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.tabItem}
              onPress={() => handleTabPress(tab.id)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={(isActive ? tab.activeIcon : tab.icon) as any}
                size={22}
                color={isActive ? tab.color : CYBER.textDim}
              />
              <Text style={[styles.tabLabel, { color: isActive ? tab.color : CYBER.textDim }]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CYBER.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    backgroundColor: CYBER.background,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    letterSpacing: 0.3,
  },
  headerRight: {},
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  liveText: {
    fontFamily: "Inter_700Bold",
    fontSize: 10,
    letterSpacing: 1,
  },
  pager: { flex: 1 },
  page: { flex: 1, backgroundColor: CYBER.background },
  tabBar: {
    flexDirection: "row",
    backgroundColor: CYBER.surface,
    borderTopWidth: 1,
    position: "relative",
  },
  tabIndicator: {
    position: "absolute",
    top: 0,
    height: 64,
    borderTopWidth: 2,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    paddingTop: 8,
  },
  tabLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 10,
    letterSpacing: 0.3,
  },
});
