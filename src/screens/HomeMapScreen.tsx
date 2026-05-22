import { useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Dimensions, Animated, SafeAreaView,
} from 'react-native';
import { topics, Topic } from '../data/vocabulary';
import { useProgress } from '../hooks/useProgress';
import OanMascot from '../components/OanMascot';

const { width: SW } = Dimensions.get('window');

const NODE_R = 34;
const NODE_D = NODE_R * 2;
const V_GAP = 128;
const H_OFF = 72;
const PAD_TOP = 90;
const MAP_HEIGHT = PAD_TOP + topics.length * V_GAP + 160;

// Zigzag: center, right, center, left
const X_PATTERN = [0, H_OFF, 0, -H_OFF];

const nodePositions = topics.map((_, i) => ({
  cx: SW / 2 + X_PATTERN[i % 4],
  cy: PAD_TOP + i * V_GAP,
}));

function pathDots(x1: number, y1: number, x2: number, y2: number) {
  return [1, 2, 3].map(i => ({
    x: x1 + (x2 - x1) * (i / 4),
    y: y1 + (y2 - y1) * (i / 4),
  }));
}

function PulsingRing({ size }: { size: number }) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.8)).current;
  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scale, { toValue: 1.3, duration: 700, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1, duration: 700, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(opacity, { toValue: 0.2, duration: 700, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.8, duration: 700, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);
  return (
    <Animated.View style={{
      position: 'absolute',
      width: size + 16, height: size + 16,
      borderRadius: (size + 16) / 2,
      borderWidth: 3, borderColor: '#FFD700',
      top: -8, left: -8,
      transform: [{ scale }],
      opacity,
    }} />
  );
}

type Props = {
  onSelectTopic: (topic: Topic) => void;
  streak: number;
  xp: number;
};

export default function HomeMapScreen({ onSelectTopic, streak, xp }: Props) {
  const { getTopicStats } = useProgress();

  const topicStates = topics.map((topic, i) => {
    const stats = getTopicStats(topic.id, topic.words.length);
    const completed = stats.known / topic.words.length >= 0.7;
    const unlocked = i === 0 || (() => {
      const prev = getTopicStats(topics[i - 1].id, topics[i - 1].words.length);
      return prev.known > 0;
    })();
    return { completed, unlocked, known: stats.known, total: topic.words.length };
  });

  const activeIdx = topicStates.findIndex(s => !s.completed && s.unlocked);
  const currentIdx = activeIdx === -1 ? topics.length - 1 : activeIdx;

  const mascotPos = nodePositions[currentIdx];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerBrand}>
          <OanMascot size={38} />
          <View>
            <Text style={styles.appName}>Area ONE</Text>
            <Text style={styles.appSub}>Học Tiếng Anh</Text>
          </View>
        </View>
        <View style={styles.headerStats}>
          <View style={styles.chip}>
            <Text style={styles.chipText}>🔥 {streak}</Text>
          </View>
          <View style={styles.chip}>
            <Text style={styles.chipText}>⭐ {xp}</Text>
          </View>
        </View>
      </View>

      {/* Map */}
      <ScrollView
        style={styles.mapScroll}
        contentContainerStyle={{ height: MAP_HEIGHT, position: 'relative' }}
        showsVerticalScrollIndicator={false}
      >
        {/* Background clouds */}
        {[
          { top: 10, left: 15 }, { top: 40, right: 20 },
          { top: 280, left: 30 }, { top: 540, right: 15 },
          { top: 800, left: 20 }, { top: 1060, right: 25 },
          { top: 1320, left: 10 }, { top: 1580, right: 20 },
        ].map((pos, i) => (
          <Text key={i} style={[styles.cloud, pos]}>☁️</Text>
        ))}

        {/* Connecting path dots */}
        {nodePositions.map((pos, i) => {
          if (i === 0) return null;
          const prev = nodePositions[i - 1];
          return pathDots(prev.cx, prev.cy, pos.cx, pos.cy).map((dot, j) => (
            <View key={`d-${i}-${j}`} style={[
              styles.pathDot,
              {
                left: dot.x - 5, top: dot.y - 5,
                backgroundColor: topicStates[i].unlocked ? '#B0C4DE' : '#DDD',
              },
            ]} />
          ));
        })}

        {/* OĂN mascot on current node */}
        <View style={{
          position: 'absolute',
          left: mascotPos.cx - 25,
          top: mascotPos.cy - NODE_R - 72,
        }}>
          <OanMascot size={68} />
        </View>

        {/* Nodes */}
        {nodePositions.map((pos, i) => {
          const state = topicStates[i];
          const topic = topics[i];
          const isActive = i === currentIdx;

          return (
            <TouchableOpacity
              key={topic.id}
              activeOpacity={state.unlocked ? 0.8 : 1}
              onPress={() => state.unlocked && onSelectTopic(topic)}
              style={[
                styles.node,
                {
                  left: pos.cx - NODE_R,
                  top: pos.cy - NODE_R,
                  backgroundColor: state.unlocked ? topic.color : '#D0D0D0',
                },
              ]}
            >
              {isActive && <PulsingRing size={NODE_D} />}

              <Text style={styles.nodeIcon}>
                {!state.unlocked ? '🔒' : topic.icon}
              </Text>

              {state.completed && (
                <View style={styles.checkBadge}>
                  <Text style={styles.checkText}>✓</Text>
                </View>
              )}

              {/* Mini progress ring */}
              {state.unlocked && !state.completed && state.known > 0 && (
                <View style={[styles.progressBadge, { backgroundColor: topic.color }]}>
                  <Text style={styles.progressBadgeText}>
                    {Math.round((state.known / state.total) * 100)}%
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        {/* Node labels */}
        {nodePositions.map((pos, i) => (
          <Text key={`lbl-${i}`} style={[
            styles.nodeLabel,
            {
              left: pos.cx - 45,
              top: pos.cy + NODE_R + 5,
              opacity: topicStates[i].unlocked ? 1 : 0.35,
            },
          ]}>
            {topics[i].name}
          </Text>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#D6EEFF' },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#DDE9F5',
  },
  headerBrand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  appName: { fontSize: 17, fontWeight: '800', color: '#A527FF' },
  appSub: { fontSize: 11, color: '#AAA' },
  headerStats: { flexDirection: 'row', gap: 8 },
  chip: {
    backgroundColor: '#EDF5FF', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: '#B8D9F5',
  },
  chipText: { fontSize: 14, fontWeight: '700', color: '#1274C6' },

  // Map
  mapScroll: { flex: 1 },
  cloud: { position: 'absolute', fontSize: 28, opacity: 0.6 },

  pathDot: {
    position: 'absolute', width: 10, height: 10,
    borderRadius: 5,
  },

  node: {
    position: 'absolute',
    width: NODE_D, height: NODE_D, borderRadius: NODE_R,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 6, elevation: 6,
  },
  nodeIcon: { fontSize: 26 },

  checkBadge: {
    position: 'absolute', bottom: -4, right: -4,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: '#00C896', alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#fff',
  },
  checkText: { fontSize: 10, color: '#fff', fontWeight: '800' },

  progressBadge: {
    position: 'absolute', bottom: -4, right: -4,
    paddingHorizontal: 5, paddingVertical: 2, borderRadius: 8,
    borderWidth: 1.5, borderColor: '#fff',
  },
  progressBadgeText: { fontSize: 9, color: '#fff', fontWeight: '700' },

  nodeLabel: {
    position: 'absolute', width: 90, textAlign: 'center',
    fontSize: 11, fontWeight: '600', color: '#444',
  },
});
