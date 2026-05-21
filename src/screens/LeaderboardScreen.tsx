import { View, Text, StyleSheet, SafeAreaView, Image } from 'react-native';

export default function LeaderboardScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🏆 Bảng xếp hạng</Text>
      </View>
      <View style={styles.content}>
        <Image source={require('../../assets/mascot.png')} style={styles.mascot} />
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
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#ECEDF8',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#2D3A8C' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 16 },
  mascot: { width: 120, height: 140, resizeMode: 'contain', opacity: 0.85 },
  title: { fontSize: 26, fontWeight: '800', color: '#7B2FBE' },
  desc: { fontSize: 15, color: '#666', textAlign: 'left', lineHeight: 26, alignSelf: 'flex-start' },
  comingSoonBadge: {
    backgroundColor: '#F5F0FF', borderRadius: 20,
    paddingHorizontal: 20, paddingVertical: 10,
    borderWidth: 1.5, borderColor: '#D4B8FF',
  },
  comingSoonText: { fontSize: 14, color: '#7B2FBE', fontWeight: '700' },
});
