import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import OanMascot from '../components/OanMascot';

export default function LeaderboardScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🏆 Bảng xếp hạng</Text>
      </View>
      <View style={styles.content}>
        <OanMascot size={120} />
        <Text style={styles.title}>Sắp ra mắt!</Text>
        <Text style={styles.desc}>
          Chế độ thách thức cộng đồng đang được phát triển.{'\n\n'}
          Bạn sẽ có thể:{'\n'}
          • Thách đấu bạn bè với từ vựng khó{'\n'}
          • Trả lời trong 10 giây{'\n'}
          • Leo hạng và kiếm điểm cùng nhau
        </Text>
        <View style={styles.comingSoonBadge}>
          <Text style={styles.comingSoonText}>⏳ Phiên bản tiếp theo</Text>
        </View>
      </View>
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
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 16 },
  title: { fontSize: 26, fontFamily: 'Nikoovers', color: '#A527FF' },
  desc: { fontSize: 15, fontFamily: 'MontserratLight', color: '#666', textAlign: 'left', lineHeight: 26, alignSelf: 'flex-start' },
  comingSoonBadge: {
    backgroundColor: '#EDF5FF', borderRadius: 20,
    paddingHorizontal: 20, paddingVertical: 10,
    borderWidth: 1.5, borderColor: '#90C5FF',
  },
  comingSoonText: { fontSize: 14, color: '#A527FF', fontWeight: '700' },
});
