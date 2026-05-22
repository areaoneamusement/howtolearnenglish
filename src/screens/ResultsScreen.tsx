import { useEffect, useRef } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity,
  SafeAreaView, Animated,
} from 'react-native';
import { Topic } from '../data/vocabulary';

type Result = { wordIndex: number; correct: boolean };

type Props = {
  topic: Topic;
  results: Result[];
  xpGained: number;
  streak: number;
  onRetry: () => void;
  onHome: () => void;
};

function getEmoji(pct: number) {
  if (pct === 100) return '🏆';
  if (pct >= 80) return '🌟';
  if (pct >= 60) return '👍';
  if (pct >= 40) return '💪';
  return '📚';
}

function getMessage(pct: number) {
  if (pct === 100) return 'Xuất sắc! Bạn nhớ hết rồi!';
  if (pct >= 80) return 'Rất tốt! Còn một chút nữa thôi!';
  if (pct >= 60) return 'Khá đấy! Luyện thêm là ổn ngay!';
  if (pct >= 40) return 'Đang tiến bộ! Đừng bỏ cuộc nhé!';
  return 'Mới bắt đầu! Ôn lại là sẽ nhớ thôi!';
}

export default function ResultsScreen({ topic, results, xpGained, streak, onRetry, onHome }: Props) {
  const remembered = results.filter(r => r.correct).length;
  const total = results.length;
  const pct = Math.round((remembered / total) * 100);

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const xpAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, friction: 6, tension: 60, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
      Animated.timing(xpAnim, { toValue: 1, duration: 600, useNativeDriver: false }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>

        <Animated.View style={{ transform: [{ scale: scaleAnim }], alignItems: 'center', gap: 8 }}>
          <Text style={styles.emoji}>{getEmoji(pct)}</Text>
          <Text style={styles.title}>Kết quả</Text>
          <Text style={styles.topicName}>{topic.icon} {topic.name}</Text>
        </Animated.View>

        {/* Score */}
        <View style={[styles.scoreBox, { borderColor: topic.color }]}>
          <Text style={[styles.scoreNumber, { color: topic.color }]}>{pct}%</Text>
          <Text style={styles.scoreDetail}>Nhớ đúng {remembered} / {total} từ</Text>
        </View>

        <Text style={styles.message}>{getMessage(pct)}</Text>

        {/* XP + Streak */}
        <View style={styles.rewardRow}>
          <View style={styles.rewardBox}>
            <Text style={styles.rewardValue}>+{xpGained}</Text>
            <Text style={styles.rewardLabel}>⭐ XP</Text>
          </View>
          <View style={[styles.rewardBox, styles.rewardBoxStreak]}>
            <Text style={styles.rewardValue}>{streak}</Text>
            <Text style={styles.rewardLabel}>🔥 Ngày liên tiếp</Text>
          </View>
        </View>

        {/* Word breakdown */}
        <View style={styles.breakdown}>
          {results.map((r, i) => (
            <View key={i} style={[styles.wordDot, r.correct ? styles.dotCorrect : styles.dotWrong]}>
              <Text style={styles.dotText}>{r.correct ? '✓' : '✗'}</Text>
            </View>
          ))}
        </View>

        {/* Buttons */}
        <View style={styles.buttons}>
          <TouchableOpacity
            style={[styles.btn, styles.btnRetry, { borderColor: topic.color }]}
            onPress={onRetry}
            activeOpacity={0.85}
          >
            <Text style={[styles.btnRetryText, { color: topic.color }]}>🔄 Học lại</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btn, styles.btnHome, { backgroundColor: topic.color }]}
            onPress={onHome}
            activeOpacity={0.85}
          >
            <Text style={styles.btnHomeText}>🏠 Về trang chủ</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FF' },
  content: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 28, gap: 20,
  },
  emoji: { fontSize: 72 },
  title: { fontSize: 26, fontWeight: '800', color: '#1274C6' },
  topicName: { fontSize: 16, color: '#888' },
  scoreBox: {
    borderWidth: 3, borderRadius: 24,
    paddingVertical: 20, paddingHorizontal: 40,
    alignItems: 'center', backgroundColor: '#fff',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 5,
  },
  scoreNumber: { fontSize: 60, fontWeight: '800', lineHeight: 68 },
  scoreDetail: { fontSize: 15, color: '#888', marginTop: 4 },
  message: { fontSize: 16, color: '#555', textAlign: 'center', fontStyle: 'italic' },
  rewardRow: { flexDirection: 'row', gap: 12, width: '100%' },
  rewardBox: {
    flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 16,
    alignItems: 'center', gap: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  rewardBoxStreak: {},
  rewardValue: { fontSize: 26, fontWeight: '800', color: '#1274C6' },
  rewardLabel: { fontSize: 13, color: '#888' },
  breakdown: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 6,
    justifyContent: 'center', maxWidth: 280,
  },
  wordDot: {
    width: 28, height: 28, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  dotCorrect: { backgroundColor: '#E8FFF8' },
  dotWrong: { backgroundColor: '#FFF0F0' },
  dotText: { fontSize: 12 },
  buttons: { width: '100%', gap: 12 },
  btn: { paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  btnRetry: { borderWidth: 2, backgroundColor: '#fff' },
  btnRetryText: { fontSize: 17, fontWeight: '700' },
  btnHome: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  btnHomeText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
