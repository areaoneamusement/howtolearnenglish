import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useProgress } from '../hooks/useProgress';
import { topics } from '../data/vocabulary';

export default function ActivityScreen() {
  const { progress, getTopicStats } = useProgress();
  const level = Math.floor(progress.xp / 100) + 1;
  const xpToNext = 100 - (progress.xp % 100);

  const totalKnown = Object.values(progress.wordProgress).filter(w => w.status === 'known').length;
  const totalLearning = Object.values(progress.wordProgress).filter(w => w.status === 'learning').length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📊 Hoạt động của tôi</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Streak */}
        <View style={styles.streakBox}>
          <Text style={styles.streakFlame}>🔥</Text>
          <Text style={styles.streakNum}>{progress.streak}</Text>
          <Text style={styles.streakLabel}>Ngày liên tiếp</Text>
          {progress.lastStudyDate ? (
            <Text style={styles.lastStudy}>Học lần cuối: {progress.lastStudyDate}</Text>
          ) : (
            <Text style={styles.lastStudy}>Chưa học lần nào — bắt đầu ngay nhé!</Text>
          )}
        </View>

        {/* Level & XP */}
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <View style={styles.statItem}>
              <Text style={styles.statBig}>Lv.{level}</Text>
              <Text style={styles.statSub}>Cấp độ</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Text style={styles.statBig}>{progress.xp}</Text>
              <Text style={styles.statSub}>Tổng XP</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Text style={styles.statBig}>{xpToNext}</Text>
              <Text style={styles.statSub}>XP lên Lv.{level + 1}</Text>
            </View>
          </View>
          <View style={styles.xpBarBg}>
            <View style={[styles.xpBarFill, { width: `${(progress.xp % 100)}%` }]} />
          </View>
        </View>

        {/* Words */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📚 Vốn từ vựng</Text>
          <View style={styles.cardRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statBig, { color: '#00C896' }]}>{totalKnown}</Text>
              <Text style={styles.statSub}>✅ Đã thuộc</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Text style={[styles.statBig, { color: '#F7B731' }]}>{totalLearning}</Text>
              <Text style={styles.statSub}>📖 Đang học</Text>
            </View>
          </View>
        </View>

        {/* Per-topic progress */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📈 Tiến độ từng chủ đề</Text>
          {topics.map(topic => {
            const stats = getTopicStats(topic.id, topic.words.length);
            const pct = topic.words.length > 0 ? stats.known / topic.words.length : 0;
            return (
              <View key={topic.id} style={styles.topicRow}>
                <Text style={styles.topicIcon}>{topic.icon}</Text>
                <View style={styles.topicInfo}>
                  <View style={styles.topicNameRow}>
                    <Text style={styles.topicName}>{topic.name}</Text>
                    <Text style={styles.topicPct}>{Math.round(pct * 100)}%</Text>
                  </View>
                  <View style={styles.miniBarBg}>
                    <View style={[styles.miniBarFill, {
                      width: `${pct * 100}%`,
                      backgroundColor: topic.color,
                    }]} />
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FF' },
  header: {
    paddingHorizontal: 20, paddingVertical: 14,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#DDE9F5',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#1274C6' },
  content: { padding: 16, gap: 16, paddingBottom: 30 },

  streakBox: {
    backgroundColor: '#A527FF', borderRadius: 20, padding: 24,
    alignItems: 'center', gap: 4,
  },
  streakFlame: { fontSize: 48 },
  streakNum: { fontSize: 56, fontWeight: '900', color: '#fff', lineHeight: 60 },
  streakLabel: { fontSize: 16, color: '#93C8F5', fontWeight: '600' },
  lastStudy: { fontSize: 12, color: '#6EB3EF', marginTop: 8 },

  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 18, gap: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#444' },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  divider: { width: 1, height: 40, backgroundColor: '#F0F0F0', marginHorizontal: 8 },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statBig: { fontSize: 24, fontWeight: '800', color: '#1274C6' },
  statSub: { fontSize: 12, color: '#888' },
  xpBarBg: { height: 8, backgroundColor: '#EDF4FF', borderRadius: 4, overflow: 'hidden' },
  xpBarFill: { height: 8, backgroundColor: '#A527FF', borderRadius: 4 },

  topicRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  topicIcon: { fontSize: 22, width: 30, textAlign: 'center' },
  topicInfo: { flex: 1, gap: 4 },
  topicNameRow: { flexDirection: 'row', justifyContent: 'space-between' },
  topicName: { fontSize: 13, fontWeight: '600', color: '#333' },
  topicPct: { fontSize: 12, color: '#888' },
  miniBarBg: { height: 5, backgroundColor: '#EDF4FF', borderRadius: 3, overflow: 'hidden' },
  miniBarFill: { height: 5, borderRadius: 3 },
});
