import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useProgress } from '../hooks/useProgress';
import { totalWordCount } from '../data/vocabulary';
import OanMascot from '../components/OanMascot';

export default function ProfileScreen() {
  const { progress } = useProgress();
  const level = Math.floor(progress.xp / 100) + 1;
  const totalKnown = Object.values(progress.wordProgress).filter(w => w.status === 'known').length;

  function handleReset() {
    Alert.alert(
      'Xóa toàn bộ tiến độ?',
      'Hành động này không thể hoàn tác. Tất cả XP, streak và từ đã học sẽ mất.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('@htlenglish_progress');
            Alert.alert('Đã xóa', 'Khởi động lại app để thấy thay đổi.');
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>👤 Hồ sơ của tôi</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Mascot + identity */}
        <View style={styles.profileBox}>
          <OanMascot size={110} />
          <Text style={styles.mascotName}>OĂN</Text>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>⭐ Cấp độ {level}</Text>
          </View>
        </View>

        {/* Stats grid */}
        <View style={styles.statsGrid}>
          {[
            { label: '🔥 Streak', value: `${progress.streak} ngày` },
            { label: '⭐ Tổng XP', value: `${progress.xp} XP` },
            { label: '✅ Đã thuộc', value: `${totalKnown} từ` },
            { label: '📚 Tổng từ', value: `${totalWordCount} từ` },
          ].map((s, i) => (
            <View key={i} style={styles.statBox}>
              <Text style={styles.statVal}>{s.value}</Text>
              <Text style={styles.statLbl}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* About */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Về Area ONE</Text>
          <Text style={styles.cardText}>
            Area ONE là app học tiếng Anh dành riêng cho người Việt mất gốc.{'\n\n'}
            Mục tiêu: giúp bạn tự tin giao tiếp tiếng Anh trong cuộc sống hàng ngày, từng bước một.
          </Text>
          <View style={styles.versionRow}>
            <Text style={styles.versionText}>Phiên bản MVP 1.0</Text>
            <Text style={styles.versionText}>🤝 Cùng xây dựng bởi bạn & Claude</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.resetBtn} onPress={handleReset} activeOpacity={0.8}>
          <Text style={styles.resetText}>🗑️ Xóa tiến độ học tập</Text>
        </TouchableOpacity>
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
  headerTitle: { fontSize: 18, fontFamily: 'Nikoovers', color: '#1274C6' },
  content: { padding: 16, gap: 16, paddingBottom: 30 },

  profileBox: {
    backgroundColor: '#1274C6', borderRadius: 20, padding: 28,
    alignItems: 'center', gap: 8,
  },
  mascotName: { fontSize: 32, fontFamily: 'Nikoovers', color: '#fff', letterSpacing: 2 },
  levelBadge: {
    backgroundColor: '#ffffff30', borderRadius: 16,
    paddingHorizontal: 16, paddingVertical: 6,
  },
  levelText: { fontSize: 15, color: '#fff', fontWeight: '700' },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statBox: {
    flex: 1, minWidth: '45%', backgroundColor: '#fff', borderRadius: 14,
    padding: 16, alignItems: 'center', gap: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  statVal: { fontSize: 20, fontWeight: '800', color: '#1274C6' },
  statLbl: { fontSize: 12, color: '#888' },

  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 18, gap: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#1274C6' },
  cardText: { fontSize: 14, color: '#666', lineHeight: 22 },
  versionRow: { gap: 4, marginTop: 4 },
  versionText: { fontSize: 12, color: '#AAA' },

  resetBtn: {
    backgroundColor: '#FFF0F0', borderRadius: 14, padding: 16,
    alignItems: 'center', borderWidth: 1, borderColor: '#FFCDD2',
  },
  resetText: { fontSize: 15, color: '#FF6B6B', fontWeight: '600' },
});
