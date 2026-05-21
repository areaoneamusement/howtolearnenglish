import { useEffect, useRef } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity,
  SafeAreaView, ScrollView, Animated,
} from 'react-native';
import { topics, Topic } from '../data/vocabulary';
import { useProgress } from '../hooks/useProgress';

type Props = {
  onSelectTopic: (topic: Topic) => void;
  onBack: () => void;
};

function TopicCard({
  topic, index, onSelect, known, learning, total,
}: {
  topic: Topic; index: number; onSelect: () => void;
  known: number; learning: number; total: number;
}) {
  const slideAnim = useRef(new Animated.Value(40)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1, duration: 300,
        delay: index * 60, useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0, friction: 8, tension: 60,
        delay: index * 60, useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const pct = total > 0 ? known / total : 0;
  const isCompleted = known === total;

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <TouchableOpacity
        style={[styles.card, isCompleted && styles.cardCompleted]}
        onPress={onSelect}
        activeOpacity={0.8}
      >
        <View style={[styles.iconBox, { backgroundColor: topic.color + '20' }]}>
          <Text style={styles.cardIcon}>{topic.icon}</Text>
        </View>

        <View style={styles.cardContent}>
          <View style={styles.cardTopRow}>
            <Text style={styles.cardName}>{topic.name}</Text>
            {isCompleted && <Text style={styles.completedBadge}>✅ Hoàn thành</Text>}
          </View>
          <Text style={styles.cardCount}>{total} từ vựng</Text>

          <View style={styles.miniBarBg}>
            <View style={[styles.miniBarFill, {
              width: `${pct * 100}%`,
              backgroundColor: topic.color,
            }]} />
          </View>

          <View style={styles.cardStats}>
            <Text style={styles.statNew}>Mới: {total - known - learning}</Text>
            <Text style={styles.statLearning}>Đang học: {learning}</Text>
            <Text style={styles.statKnown}>Thuộc: {known}</Text>
          </View>
        </View>

        <Text style={[styles.cardArrow, { color: topic.color }]}>›</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function TopicsScreen({ onSelectTopic, onBack }: Props) {
  const { getTopicStats } = useProgress();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>‹ Quay lại</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chọn chủ đề</Text>
        <View style={{ width: 80 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.hint}>Hôm nay bạn muốn học gì? 🤔</Text>
        {topics.map((topic, index) => {
          const stats = getTopicStats(topic.id, topic.words.length);
          return (
            <TopicCard
              key={topic.id}
              topic={topic}
              index={index}
              onSelect={() => onSelectTopic(topic)}
              known={stats.known}
              learning={stats.learning}
              total={topic.words.length}
            />
          );
        })}
        <View style={{ height: 16 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FF' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#ECEDF8',
  },
  backButton: { width: 80 },
  backText: { fontSize: 18, color: '#6C63FF', fontWeight: '600' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#2D3A8C' },
  list: { padding: 16, gap: 12 },
  hint: { fontSize: 15, color: '#888', marginBottom: 4 },
  card: {
    backgroundColor: '#fff', borderRadius: 18, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
  },
  cardCompleted: { borderWidth: 1.5, borderColor: '#4ECDC4' },
  iconBox: {
    width: 52, height: 52, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  cardIcon: { fontSize: 28 },
  cardContent: { flex: 1, gap: 4 },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardName: { fontSize: 16, fontWeight: '700', color: '#2D3A8C' },
  completedBadge: { fontSize: 11, color: '#00B894', fontWeight: '600' },
  cardCount: { fontSize: 12, color: '#AAA' },
  miniBarBg: {
    height: 4, backgroundColor: '#F0F1FF',
    borderRadius: 2, overflow: 'hidden', marginVertical: 4,
  },
  miniBarFill: { height: 4, borderRadius: 2 },
  cardStats: { flexDirection: 'row', gap: 10 },
  statNew: { fontSize: 11, color: '#AAA' },
  statLearning: { fontSize: 11, color: '#F7B731' },
  statKnown: { fontSize: 11, color: '#00B894', fontWeight: '600' },
  cardArrow: { fontSize: 28, fontWeight: '300' },
});
