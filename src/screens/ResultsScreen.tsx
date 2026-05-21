import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView } from 'react-native';
import { Topic } from '../data/vocabulary';

type Props = {
  topic: Topic;
  remembered: number;
  total: number;
  onRetry: () => void;
  onHome: () => void;
};

function getEmoji(score: number): string {
  if (score === 100) return '🏆';
  if (score >= 80) return '🌟';
  if (score >= 60) return '👍';
  if (score >= 40) return '💪';
  return '📚';
}

function getMessage(score: number): string {
  if (score === 100) return 'Xuất sắc! Bạn nhớ hết rồi!';
  if (score >= 80) return 'Rất tốt! Còn một chút nữa thôi!';
  if (score >= 60) return 'Khá đấy! Luyện thêm là ổn ngay!';
  if (score >= 40) return 'Đang tiến bộ! Đừng bỏ cuộc nhé!';
  return 'Mới bắt đầu! Ôn lại là sẽ nhớ thôi!';
}

export default function ResultsScreen({ topic, remembered, total, onRetry, onHome }: Props) {
  const score = Math.round((remembered / total) * 100);
  const emoji = getEmoji(score);
  const message = getMessage(score);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={styles.title}>Kết quả</Text>
        <Text style={styles.topicName}>{topic.icon} {topic.name}</Text>

        <View style={[styles.scoreBox, { borderColor: topic.color }]}>
          <Text style={[styles.scoreNumber, { color: topic.color }]}>{score}%</Text>
          <Text style={styles.scoreDetail}>
            Nhớ được {remembered} / {total} từ
          </Text>
        </View>

        <Text style={styles.message}>{message}</Text>

        <View style={styles.buttons}>
          <TouchableOpacity
            style={[styles.btn, styles.btnRetry, { borderColor: topic.color }]}
            onPress={onRetry}
          >
            <Text style={[styles.btnRetryText, { color: topic.color }]}>🔄 Học lại</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, styles.btnHome, { backgroundColor: topic.color }]}
            onPress={onHome}
          >
            <Text style={styles.btnHomeText}>🏠 Về trang chủ</Text>
          </TouchableOpacity>
        </View>
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
    gap: 20,
  },
  emoji: {
    fontSize: 80,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a237e',
  },
  topicName: {
    fontSize: 18,
    color: '#666',
  },
  scoreBox: {
    borderWidth: 3,
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 48,
    alignItems: 'center',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  scoreNumber: {
    fontSize: 64,
    fontWeight: 'bold',
    lineHeight: 72,
  },
  scoreDetail: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  message: {
    fontSize: 18,
    color: '#444',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  buttons: {
    width: '100%',
    gap: 12,
    marginTop: 8,
  },
  btn: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  btnRetry: {
    borderWidth: 2,
    backgroundColor: '#fff',
  },
  btnRetryText: {
    fontSize: 18,
    fontWeight: '600',
  },
  btnHome: {
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  btnHomeText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
