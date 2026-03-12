import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View, Text, StyleSheet, Animated, Dimensions,
  TouchableOpacity, ScrollView, Pressable, LayoutChangeEvent
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import CyberCard from "@/components/cyber/CyberCard";
import GlowButton from "@/components/cyber/GlowButton";
import { GAME_LEVELS, AVATARS, getRank } from "@/data/gameData";
import { useProfile } from "@/context/ProfileContext";

const { CYBER } = Colors;
const { width } = Dimensions.get("window");
const TRACK_PADDING = 20;
const GAME_WIDTH = width - TRACK_PADDING * 2;
const LANE_OFFSET = GAME_WIDTH / 4;
const GATE_DURATION = 3200;

type GameState = "select_avatar" | "pregame" | "playing" | "feedback" | "results";
type Lane = "left" | "right";

export default function CyberRunnerGame() {
  const [gameState, setGameState] = useState<GameState>("select_avatar");
  const [currentLevel, setCurrentLevel] = useState(0);
  const [currentGate, setCurrentGate] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAvatar, setSelectedAvatar] = useState(0);
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);
  const [lastExplanation, setLastExplanation] = useState("");
  const [currentLane, setCurrentLane] = useState<Lane>("left");
  const [trackHeight, setTrackHeight] = useState(300);

  const currentLaneRef = useRef<Lane>("left");

  const avatarX = useRef(new Animated.Value(-LANE_OFFSET)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const strideAnim = useRef(new Animated.Value(0)).current;
  const gateY = useRef(new Animated.Value(-200)).current;
  const feedbackScale = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const leftGateGlow = useRef(new Animated.Value(0)).current;
  const rightGateGlow = useRef(new Animated.Value(0)).current;
  const speedLine1 = useRef(new Animated.Value(0)).current;
  const speedLine2 = useRef(new Animated.Value(0)).current;
  const bounceLoopRef = useRef<Animated.CompositeAnimation | null>(null);
  const gateAnimRef = useRef<Animated.CompositeAnimation | null>(null);

  const { profile, setAvatar: saveAvatar, updateGameScore } = useProfile();
  const level = GAME_LEVELS[currentLevel];
  const totalGates = level.pairs.length;
  const currentPair = level.pairs[currentGate];

  const [gateLayouts] = useState<Lane[]>(() =>
    Array.from({ length: 10 }, () => (Math.random() > 0.5 ? "left" : "right") as Lane)
  );
  const scamLane = gateLayouts[currentGate % gateLayouts.length];
  const leftGateData = scamLane === "left" ? currentPair?.[0] : currentPair?.[1];
  const rightGateData = scamLane === "right" ? currentPair?.[0] : currentPair?.[1];

  const startBounceLoop = useCallback(() => {
    bounceLoopRef.current?.stop();
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: -12, duration: 220, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: -8, duration: 180, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
      ])
    );
    loop.start();
    bounceLoopRef.current = loop;

    Animated.loop(
      Animated.sequence([
        Animated.timing(strideAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.timing(strideAnim, { toValue: -1, duration: 220, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(speedLine1, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(speedLine1, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(speedLine2, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(speedLine2, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const stopBounceLoop = useCallback(() => {
    bounceLoopRef.current?.stop();
    bounceAnim.stopAnimation();
    bounceAnim.setValue(0);
  }, []);

  const startGateSlide = useCallback(() => {
    gateY.setValue(-200);
    const gateStop = trackHeight - 220;
    const anim = Animated.timing(gateY, {
      toValue: gateStop > 0 ? gateStop : trackHeight / 2,
      duration: GATE_DURATION,
      useNativeDriver: true,
    });
    gateAnimRef.current = anim;
    anim.start(({ finished }) => {
      if (finished) {
        evaluateChoice();
      }
    });
  }, [trackHeight]);

  useEffect(() => {
    if (gameState === "playing") {
      startBounceLoop();
      startGateSlide();

      Animated.loop(
        Animated.sequence([
          Animated.timing(leftGateGlow, { toValue: 1, duration: 1000, useNativeDriver: true }),
          Animated.timing(leftGateGlow, { toValue: 0.3, duration: 1000, useNativeDriver: true }),
        ])
      ).start();
      Animated.loop(
        Animated.sequence([
          Animated.timing(rightGateGlow, { toValue: 0.3, duration: 1000, useNativeDriver: true }),
          Animated.timing(rightGateGlow, { toValue: 1, duration: 1000, useNativeDriver: true }),
        ])
      ).start();
    }
    return () => {
      stopBounceLoop();
      gateAnimRef.current?.stop();
    };
  }, [gameState, currentGate, trackHeight]);

  const moveTolane = useCallback((lane: Lane) => {
    const targetX = lane === "left" ? -LANE_OFFSET : LANE_OFFSET;
    currentLaneRef.current = lane;
    setCurrentLane(lane);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.spring(avatarX, {
      toValue: targetX,
      useNativeDriver: true,
      speed: 30,
      bounciness: 8,
    }).start();
  }, []);

  const evaluateChoice = useCallback(() => {
    const lane = currentLaneRef.current;
    const safeGate = scamLane === "left" ? rightGateData : leftGateData;
    const chosenGate = lane === "left" ? leftGateData : rightGateData;
    if (!chosenGate) return;

    const isCorrect = !chosenGate.isScam;
    setLastCorrect(isCorrect);
    setLastExplanation(chosenGate.explanation);

    const newScore = Math.max(0, score + (isCorrect ? 10 : -5));
    setScore(newScore);

    Haptics.impactAsync(isCorrect ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Heavy);
    stopBounceLoop();
    gateAnimRef.current?.stop();

    feedbackScale.setValue(0);
    Animated.spring(feedbackScale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 5,
    }).start();

    setGameState("feedback");
  }, [score, scamLane, leftGateData, rightGateData]);

  const handleNextGate = useCallback(() => {
    feedbackScale.setValue(0);
    const next = currentGate + 1;

    Animated.timing(progressAnim, {
      toValue: next / totalGates,
      duration: 500,
      useNativeDriver: false,
    }).start();

    if (next >= totalGates) {
      const finalScore = Math.round((score / (totalGates * 10)) * 100);
      updateGameScore(finalScore, true);
      setGameState("results");
    } else {
      setCurrentGate(next);
      currentLaneRef.current = "left";
      setCurrentLane("left");
      avatarX.setValue(-LANE_OFFSET);
      gateY.setValue(-200);
      setGameState("playing");
    }
  }, [currentGate, score, totalGates]);

  const handleRestart = useCallback(() => {
    setCurrentGate(0);
    setScore(0);
    currentLaneRef.current = "left";
    setCurrentLane("left");
    avatarX.setValue(-LANE_OFFSET);
    gateY.setValue(-200);
    progressAnim.setValue(0);
    setGameState("playing");
  }, []);

  const handleNextLevel = useCallback(() => {
    if (currentLevel < GAME_LEVELS.length - 1) {
      setCurrentLevel(l => l + 1);
      setCurrentGate(0);
      setScore(0);
      currentLaneRef.current = "left";
      setCurrentLane("left");
      avatarX.setValue(-LANE_OFFSET);
      gateY.setValue(-200);
      progressAnim.setValue(0);
      setGameState("pregame");
    }
  }, [currentLevel]);

  const finalScore = Math.round((score / Math.max(totalGates * 10, 1)) * 100);
  const { rank: finalRank, color: rankColor } = getRank(finalScore);
  const av = AVATARS[selectedAvatar];

  const strideRotate = strideAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ["-6deg", "6deg"],
  });

  const speedLine1Y = speedLine1.interpolate({ inputRange: [0, 1], outputRange: [-20, trackHeight] });
  const speedLine2Y = speedLine2.interpolate({ inputRange: [0, 1], outputRange: [-20, trackHeight] });

  if (gameState === "select_avatar") {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.screenTitle}>Choose Your Avatar</Text>
        <Text style={styles.screenSubtitle}>Select your cyber identity before entering the arena</Text>
        <View style={styles.avatarGrid}>
          {AVATARS.map((a, i) => (
            <Pressable
              key={a.id}
              onPress={() => setSelectedAvatar(i)}
              style={[styles.avatarCard, {
                borderColor: selectedAvatar === i ? a.color : CYBER.border,
                backgroundColor: selectedAvatar === i ? a.color + "18" : CYBER.surface,
                shadowColor: selectedAvatar === i ? a.color : "transparent",
              }]}
            >
              <Animated.Text style={[styles.avatarEmoji, selectedAvatar === i && {
                transform: [{ scale: 1.1 }]
              }]}>{a.emoji}</Animated.Text>
              <Text style={[styles.avatarName, { color: selectedAvatar === i ? a.color : CYBER.text }]}>
                {a.name}
              </Text>
              {selectedAvatar === i && (
                <View style={[styles.selectedBadge, { backgroundColor: a.color }]}>
                  <Ionicons name="checkmark" size={12} color={CYBER.background} />
                </View>
              )}
            </Pressable>
          ))}
        </View>
        <GlowButton
          label="Start Mission"
          onPress={() => { saveAvatar(av.id); setGameState("pregame"); }}
          color={av.color}
          textColor={CYBER.background}
          size="lg"
          style={styles.fullButton}
        />
      </ScrollView>
    );
  }

  if (gameState === "pregame") {
    const diff = level.difficulty;
    const diffColor = diff === "Beginner" ? CYBER.green : diff === "Intermediate" ? CYBER.yellow : CYBER.red;
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.screenTitle}>Level {level.level}</Text>
        <View style={[styles.diffBadge, { backgroundColor: diffColor + "20", borderColor: diffColor + "60" }]}>
          <Text style={[styles.diffText, { color: diffColor }]}>{diff}</Text>
        </View>
        <View style={styles.avatarPreview}>
          <Text style={styles.avatarEmojiLarge}>{av.emoji}</Text>
        </View>
        <CyberCard glowColor={CYBER.cyan} style={styles.infoCard}>
          {[
            { icon: "gate", label: `${totalGates} gates to navigate`, color: CYBER.cyan },
            { icon: "check-circle", label: "+10 pts for safe gate", color: CYBER.green },
            { icon: "close-circle", label: "-5 pts for scam gate", color: CYBER.red },
            { icon: "run-fast", label: "Steer with LEFT / RIGHT taps", color: CYBER.blue },
          ].map((row, i) => (
            <View key={i} style={styles.infoRow}>
              <MaterialCommunityIcons name={row.icon as any} size={20} color={row.color} />
              <Text style={[styles.infoText, { color: CYBER.text }]}>{row.label}</Text>
            </View>
          ))}
        </CyberCard>
        <GlowButton label="Begin Level" onPress={() => setGameState("playing")} color={CYBER.cyan} textColor={CYBER.background} size="lg" style={styles.fullButton} />
        <GlowButton label="Change Avatar" onPress={() => setGameState("select_avatar")} color={CYBER.textDim} size="md" variant="outline" style={{ marginTop: 10 }} />
      </ScrollView>
    );
  }

  if (gameState === "results") {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.screenTitle}>Level {level.level} Complete!</Text>
        <View style={styles.resultsBlock}>
          <Text style={styles.resultEmoji}>{av.emoji}</Text>
          <Text style={[styles.resultBigScore, { color: rankColor }]}>{finalScore}</Text>
          <Text style={styles.resultScoreLabel}>Final Score</Text>
          <View style={[styles.rankChip, { backgroundColor: rankColor + "20", borderColor: rankColor + "60" }]}>
            <Text style={[styles.rankChipText, { color: rankColor }]}>{finalRank}</Text>
          </View>
        </View>
        <View style={styles.statsRow}>
          {[
            { val: `${Math.round(finalScore / 10)}`, lbl: "Correct", color: CYBER.green },
            { val: `${totalGates - Math.round(finalScore / 10)}`, lbl: "Missed", color: CYBER.red },
            { val: `${totalGates}`, lbl: "Gates", color: CYBER.cyan },
          ].map((s, i) => (
            <CyberCard key={i} glowColor={s.color} padding={14} style={styles.statCard}>
              <Text style={[styles.statVal, { color: s.color }]}>{s.val}</Text>
              <Text style={styles.statLbl}>{s.lbl}</Text>
            </CyberCard>
          ))}
        </View>
        <GlowButton label="Play Again" onPress={handleRestart} color={CYBER.cyan} textColor={CYBER.background} size="lg" style={styles.fullButton} />
        {currentLevel < GAME_LEVELS.length - 1 && (
          <GlowButton label={`Next: Level ${currentLevel + 2}`} onPress={handleNextLevel} color={CYBER.green} textColor={CYBER.background} size="lg" style={{ marginTop: 10 }} />
        )}
        <GlowButton label="Change Avatar" onPress={() => setGameState("select_avatar")} color={CYBER.textDim} size="md" variant="outline" style={{ marginTop: 10 }} />
      </ScrollView>
    );
  }

  const isPlaying = gameState === "playing";
  const isFeedback = gameState === "feedback";

  return (
    <View style={styles.gameRoot}>
      <View style={styles.hud}>
        <View>
          <Text style={styles.hudScore}>Score: {score}</Text>
          <Text style={styles.hudGate}>Gate {currentGate + 1}/{totalGates}</Text>
        </View>
        <View style={styles.progressContainer}>
          <Animated.View style={[styles.progressFill, {
            width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }),
          }]} />
        </View>
        <View style={[styles.lvBadge, {
          backgroundColor: level.difficulty === "Beginner" ? CYBER.green + "20"
            : level.difficulty === "Intermediate" ? CYBER.yellow + "20" : CYBER.red + "20"
        }]}>
          <Text style={[styles.lvText, {
            color: level.difficulty === "Beginner" ? CYBER.green
              : level.difficulty === "Intermediate" ? CYBER.yellow : CYBER.red
          }]}>LV{level.level}</Text>
        </View>
      </View>

      <View
        style={styles.track}
        onLayout={(e: LayoutChangeEvent) => setTrackHeight(e.nativeEvent.layout.height)}
      >
        <View style={styles.laneDivider} />

        <View style={styles.laneLabel}>
          <Text style={styles.laneLabelText}>LEFT</Text>
          <Text style={styles.laneLabelText}>RIGHT</Text>
        </View>

        <Animated.View style={[styles.speedLine, styles.speedLine1, { transform: [{ translateY: speedLine1Y }] }]} />
        <Animated.View style={[styles.speedLine, styles.speedLine2, { transform: [{ translateY: speedLine2Y }] }]} />

        {isPlaying && currentPair && (
          <Animated.View style={[styles.gateRow, { transform: [{ translateY: gateY }] }]}>
            <Animated.View style={[styles.gate, styles.leftGate, {
              borderColor: CYBER.blue,
              opacity: leftGateGlow,
              shadowColor: CYBER.blue,
            }]}>
              <MaterialCommunityIcons name="shield-half" size={14} color={CYBER.blue} style={{ marginBottom: 4 }} />
              <Text style={styles.gateText} numberOfLines={5}>{leftGateData?.text}</Text>
            </Animated.View>
            <Animated.View style={[styles.gate, styles.rightGate, {
              borderColor: CYBER.purple,
              opacity: rightGateGlow,
              shadowColor: CYBER.purple,
            }]}>
              <MaterialCommunityIcons name="shield-half" size={14} color={CYBER.purple} style={{ marginBottom: 4 }} />
              <Text style={styles.gateText} numberOfLines={5}>{rightGateData?.text}</Text>
            </Animated.View>
          </Animated.View>
        )}

        <View style={styles.avatarWrapper}>
          <Animated.View style={{ transform: [{ translateX: avatarX }] }}>
            <Animated.View style={{
              transform: [
                { translateY: bounceAnim },
                { rotate: strideRotate },
              ]
            }}>
              <Text style={styles.avatarRunEmoji}>{av.emoji}</Text>
            </Animated.View>
            <View style={[styles.avatarShadow, { shadowColor: av.color }]} />
          </Animated.View>
        </View>

        {isFeedback && (
          <Animated.View style={[styles.feedbackOverlay, { transform: [{ scale: feedbackScale }] }]}>
            <View style={[styles.feedbackBox, {
              borderColor: lastCorrect ? CYBER.green : CYBER.red,
              backgroundColor: lastCorrect ? CYBER.green + "18" : CYBER.red + "18",
            }]}>
              <Text style={styles.feedbackIcon}>{lastCorrect ? "✓" : "✗"}</Text>
              <Text style={[styles.feedbackTitle, { color: lastCorrect ? CYBER.green : CYBER.red }]}>
                {lastCorrect ? "Safe Choice!" : "That Was A Scam!"}
              </Text>
              <Text style={styles.feedbackExplain}>{lastExplanation}</Text>
              <GlowButton
                label="Continue"
                onPress={handleNextGate}
                color={lastCorrect ? CYBER.green : CYBER.cyan}
                textColor={CYBER.background}
                size="md"
                style={{ marginTop: 12, alignSelf: "stretch" }}
              />
            </View>
          </Animated.View>
        )}
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.controlBtn, styles.controlLeft, {
            backgroundColor: currentLane === "left" ? av.color + "25" : CYBER.surface,
            borderColor: currentLane === "left" ? av.color : CYBER.border,
          }]}
          onPress={() => moveTolane("left")}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={28} color={currentLane === "left" ? av.color : CYBER.textDim} />
          <Text style={[styles.controlLabel, { color: currentLane === "left" ? av.color : CYBER.textDim }]}>LEFT</Text>
        </TouchableOpacity>
        <View style={styles.controlDivider} />
        <TouchableOpacity
          style={[styles.controlBtn, styles.controlRight, {
            backgroundColor: currentLane === "right" ? av.color + "25" : CYBER.surface,
            borderColor: currentLane === "right" ? av.color : CYBER.border,
          }]}
          onPress={() => moveTolane("right")}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-forward" size={28} color={currentLane === "right" ? av.color : CYBER.textDim} />
          <Text style={[styles.controlLabel, { color: currentLane === "right" ? av.color : CYBER.textDim }]}>RIGHT</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CYBER.background },
  scrollContent: { padding: 20, paddingBottom: 60 },
  screenTitle: { fontFamily: "Inter_700Bold", fontSize: 26, color: CYBER.text, textAlign: "center", marginBottom: 8 },
  screenSubtitle: { fontFamily: "Inter_400Regular", fontSize: 14, color: CYBER.textSecondary, textAlign: "center", marginBottom: 24, lineHeight: 20 },
  avatarGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, justifyContent: "center", marginBottom: 24 },
  avatarCard: {
    width: (width - 64) / 2,
    borderRadius: 16, borderWidth: 2,
    padding: 20, alignItems: "center", gap: 8,
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 12, elevation: 6,
    position: "relative",
  },
  avatarEmoji: { fontSize: 42 },
  avatarName: { fontFamily: "Inter_600SemiBold", fontSize: 13, textAlign: "center" },
  selectedBadge: {
    position: "absolute", top: 8, right: 8,
    width: 22, height: 22, borderRadius: 11,
    alignItems: "center", justifyContent: "center",
  },
  fullButton: { alignSelf: "stretch" },
  diffBadge: { alignSelf: "center", borderRadius: 20, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 6, marginBottom: 16 },
  diffText: { fontFamily: "Inter_700Bold", fontSize: 14, letterSpacing: 1 },
  avatarPreview: { alignItems: "center", marginBottom: 20 },
  avatarEmojiLarge: { fontSize: 64 },
  infoCard: { marginBottom: 24 },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 8, paddingTop: 10 },
  infoText: { fontFamily: "Inter_500Medium", fontSize: 14 },
  resultsBlock: { alignItems: "center", marginVertical: 16, gap: 8 },
  resultEmoji: { fontSize: 64 },
  resultBigScore: { fontFamily: "Inter_700Bold", fontSize: 72 },
  resultScoreLabel: { fontFamily: "Inter_400Regular", fontSize: 14, color: CYBER.textSecondary },
  rankChip: { borderRadius: 20, borderWidth: 1, paddingHorizontal: 20, paddingVertical: 8 },
  rankChipText: { fontFamily: "Inter_700Bold", fontSize: 15, letterSpacing: 1 },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 24 },
  statCard: { flex: 1, alignItems: "center" },
  statVal: { fontFamily: "Inter_700Bold", fontSize: 28 },
  statLbl: { fontFamily: "Inter_400Regular", fontSize: 12, color: CYBER.textSecondary },

  gameRoot: { flex: 1, backgroundColor: CYBER.background },
  hud: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: TRACK_PADDING,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: CYBER.border,
  },
  hudScore: { fontFamily: "Inter_700Bold", fontSize: 18, color: CYBER.cyan },
  hudGate: { fontFamily: "Inter_400Regular", fontSize: 12, color: CYBER.textSecondary, marginTop: 2 },
  progressContainer: {
    flex: 1,
    height: 4,
    backgroundColor: CYBER.border,
    borderRadius: 2,
    overflow: "hidden",
    marginHorizontal: 12,
  },
  progressFill: { height: "100%", backgroundColor: CYBER.cyan, borderRadius: 2 },
  lvBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  lvText: { fontFamily: "Inter_700Bold", fontSize: 13 },
  track: {
    flex: 1,
    backgroundColor: CYBER.surface,
    marginHorizontal: TRACK_PADDING,
    marginTop: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: CYBER.border,
    overflow: "hidden",
    position: "relative",
  },
  laneDivider: {
    position: "absolute",
    top: 0, bottom: 0,
    left: "50%",
    width: 1,
    backgroundColor: CYBER.border,
    zIndex: 1,
  },
  laneLabel: {
    position: "absolute",
    top: 8,
    left: 0, right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    zIndex: 2,
  },
  laneLabelText: {
    fontFamily: "Inter_700Bold",
    fontSize: 10,
    color: CYBER.textDim,
    letterSpacing: 2,
  },
  speedLine: {
    position: "absolute",
    width: 1,
    height: 40,
    opacity: 0.3,
  },
  speedLine1: { left: "25%", backgroundColor: CYBER.cyan },
  speedLine2: { left: "75%", backgroundColor: CYBER.purple },
  gateRow: {
    position: "absolute",
    top: 0,
    left: 8, right: 8,
    flexDirection: "row",
    gap: 8,
    zIndex: 5,
  },
  gate: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1.5,
    padding: 10,
    minHeight: 130,
    backgroundColor: CYBER.background,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  leftGate: {},
  rightGate: {},
  gateText: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: CYBER.text,
    lineHeight: 16,
    textAlign: "center",
  },
  avatarWrapper: {
    position: "absolute",
    bottom: 16,
    left: 0, right: 0,
    alignItems: "center",
    zIndex: 6,
  },
  avatarRunEmoji: { fontSize: 48 },
  avatarShadow: {
    alignSelf: "center",
    width: 36,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.1)",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 4,
    marginTop: -4,
  },
  feedbackOverlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: CYBER.background + "D0",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    zIndex: 20,
  },
  feedbackBox: {
    width: "100%",
    borderRadius: 16,
    borderWidth: 2,
    padding: 20,
    alignItems: "center",
    gap: 8,
  },
  feedbackIcon: { fontSize: 44 },
  feedbackTitle: { fontFamily: "Inter_700Bold", fontSize: 20 },
  feedbackExplain: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: CYBER.textSecondary,
    textAlign: "center",
    lineHeight: 19,
  },
  controls: {
    flexDirection: "row",
    height: 80,
    marginHorizontal: TRACK_PADDING,
    marginVertical: 10,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: CYBER.border,
  },
  controlBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    borderWidth: 1,
  },
  controlLeft: { borderRadius: 0 },
  controlRight: { borderRadius: 0 },
  controlDivider: { width: 1, backgroundColor: CYBER.border },
  controlLabel: { fontFamily: "Inter_700Bold", fontSize: 11, letterSpacing: 1.5 },
});
