import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { topics, Topic } from '../data/vocabulary';

type Props = {
  onSelectTopic: (topic: Topic) => void;
  onBack: () => void;
};

export default function TopicsScreen({ onSelectTopic, onBack }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>← Quay lại</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chọn chủ đề</Text>
        <View style={{ width: 80 }} />
      </View>

      <ScrollView contentContainerStyle={styles.grid}>
        <Text style={styles.hint}>Hôm nay bạn muốn học gì?</Text>
        {topics.map((topic) => (
          <TouchableOpacity
            key={topic.id}
            style={[styles.card, { borderLeftColor: topic.color }]}
            onPress={() => onSelectTopic(topic)}
            activeOpacity={0.8}
          >
            <Text style={styles.cardIcon}>{topic.icon}</Text>
            <View style={styles.cardContent}>
              <Text style={styles.cardName}>{topic.name}</Text>
              <Text style={styles.cardCount}>{topic.words.length} từ vựng</Text>
            </View>
            <Text style={[styles.cardArrow, { color: topic.color }]}>→</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F8FF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e8eaf6',
  },
  backButton: {
    width: 80,
  },
  backText: {
    fontSize: 16,
    color: '#3F51B5',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a237e',
  },
  grid: {
    padding: 20,
    gap: 16,
  },
  hint: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  cardIcon: {
    fontSize: 36,
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 4,
  },
  cardCount: {
    fontSize: 14,
    color: '#888',
  },
  cardArrow: {
    fontSize: 22,
    fontWeight: 'bold',
  },
});
