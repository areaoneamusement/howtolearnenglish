import { useEffect, useRef } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity,
  SafeAreaView, Animated,
} from 'react-native';
import { UserProgress } from '../hooks/useProgress';
import { totalWordCount } from '../data/vocabulary';

type Props = {
  onStart: () => void;
  progress: UserProgress;
};

function xpToLevel(xp: number): { level: number; progress: number } {
  const level = Math.floor(xp / 100) + 1;
  const progress = (xp % 100) / 100;
  return { level, progress };
}

export default function HomeScreen({ onStart, progress }: Props) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 50, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 8, tension: 50, useNativeDriver: true }),
    ]).start();
  }, []);

  const { level, progress: levelProgress } = xpToLevel(progress.xp);
  const totalKnown = Object.values(progress.wordProgress)
    .filter(w => w.status === 'known').length;

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

        {/* Header */}
        <Animated.View style={[styles.logoBox, { transform: [{ scale: scaleAnim }] }]}>
          <Text style={styles.flag}>🇬🇧</Text>
          <Text style={styles.title}>Học Tiếng Anh</Text>
          <Text style={styles.subtitle}>Dành cho người mất gốc</Text>
        </Animated.View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{progress.streak}</Text>
            <Text style={styles.statLabel}>🔥 Streak</Text>
          </View>
          <View style={[styles.statBox, styles.statBoxMiddle]}>
            <Text style={styles.statNum}>Lv.{level}</Text>
            <Text style={styles.statLabel}>⭐ Cấp độ</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{totalKnown}</Text>
            <Text style={styles.statLabel}>✅ Đã nhớ</Text>
          </View>
        </View>

        {/* XP bar */}
        <View style={styles.xpSection}>
          <View style={styles.xpRow}>
            <Text style={styles.xpLabel}>XP: {progress.xp}</Text>
            <Text style={styles.xpLabel}>Đến Lv.{level + 1}: {100 - (progress.xp % 100)} XP</Text>
          </View>
          <View style={styles.xpBarBg}>
            <Animated.View style={[styles.xpBarFill, { width: `${levelProgress * 100}%` }]} />
          </View>
        </View>

        {/* Progress */}
        <View style={styles.progressBox}>
          <Text style={styles.progressTitle}>📊 Tiến độ tổng</Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, {
              width: totalWordCount > 0 ? `${(totalKnown / totalWordCount) * 100}%` : '0%'
            }]} />
          </View>
          <Text style={styles.progressText}>
            {totalKnown} / {totalWordCount} từ đã thuộc
          </Text>
        </View>

        {/* Start button */}
        <TouchableOpacity style={styles.button} onPress={onStart} activeOpacity={0.85}>
          <Text style={styles.buttonText}>Bắt đầu học →</Text>
        </TouchableOpacity>

        <Text style={styles.tip}>💡 Mỗi ngày 10 phút — đủ để tiến bộ thật sự!</Text>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FF' },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
    justifyContent: 'center',
    gap: 20,
  },
  logoBox: { alignItems: 'center', gap: 4 },
  flag: { fontSize: 64 },
  title: { fontSize: 30, fontWeight: '800', color: '#2D3A8C', letterSpacing: -0.5 },
  subtitle: { fontSize: 16, color: '#7B89C9' },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    gap: 0,
  },
  statBox: { flex: 1, alignItems: 'center', gap: 4 },
  statBoxMiddle: {
    borderLeftWidth: 1, borderRightWidth: 1,
    borderColor: '#ECEDF8',
  },
  statNum: { fontSize: 22, fontWeight: '800', color: '#2D3A8C' },
  statLabel: { fontSize: 12, color: '#999' },
  xpSection: { gap: 6 },
  xpRow: { flexDirection: 'row', justifyContent: 'space-between' },
  xpLabel: { fontSize: 12, color: '#888' },
  xpBarBg: {
    height: 8, backgroundColor: '#E8EAFF',
    borderRadius: 4, overflow: 'hidden',
  },
  xpBarFill: {
    height: 8, backgroundColor: '#6C63FF',
    borderRadius: 4,
  },
  progressBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  progressTitle: { fontSize: 14, fontWeight: '600', color: '#444' },
  progressBarBg: {
    height: 10, backgroundColor: '#F0F1FF',
    borderRadius: 5, overflow: 'hidden',
  },
  progressBarFill: {
    height: 10, backgroundColor: '#4ECDC4',
    borderRadius: 5,
  },
  progressText: { fontSize: 13, color: '#888', textAlign: 'right' },
  button: {
    backgroundColor: '#6C63FF',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonText: { color: '#fff', fontSize: 20, fontWeight: '800' },
  tip: { fontSize: 13, color: '#AAA', textAlign: 'center' },
});
