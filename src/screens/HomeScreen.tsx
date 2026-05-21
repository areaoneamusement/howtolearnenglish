import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView } from 'react-native';

type Props = {
  onStart: () => void;
};

export default function HomeScreen({ onStart }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.flag}>🇬🇧</Text>
        <Text style={styles.title}>Học Tiếng Anh</Text>
        <Text style={styles.subtitle}>Dành cho người mất gốc</Text>

        <View style={styles.descBox}>
          <Text style={styles.descText}>✅ Học từ vựng theo chủ đề</Text>
          <Text style={styles.descText}>✅ Giải thích bằng tiếng Việt</Text>
          <Text style={styles.descText}>✅ Luyện tập mỗi ngày một ít</Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={onStart}>
          <Text style={styles.buttonText}>Bắt đầu học →</Text>
        </TouchableOpacity>

        <Text style={styles.tip}>💡 Mỗi ngày 10 phút là đủ để tiến bộ!</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F8FF',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  flag: {
    fontSize: 72,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#5c6bc0',
    marginBottom: 40,
  },
  descBox: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    gap: 12,
  },
  descText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#3F51B5',
    paddingVertical: 18,
    paddingHorizontal: 48,
    borderRadius: 50,
    shadowColor: '#3F51B5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 32,
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  tip: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
});
