import { useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity,
  SafeAreaView, Animated,
} from 'react-native';
import { Topic, Word } from '../data/vocabulary';

type Props = {
  topic: Topic;
  onFinish: (remembered: number, total: number) => void;
  onBack: () => void;
};

export default function GameScreen({ topic, onFinish, onBack }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [rememberedCount, setRememberedCount] = useState(0);

  const currentWord: Word = topic.words[currentIndex];
  const total = topic.words.length;
  const progress = currentIndex / total;

  function handleAnswer(remembered: boolean) {
    const newRemembered = remembered ? rememberedCount + 1 : rememberedCount;
    if (currentIndex + 1 >= total) {
      onFinish(newRemembered, total);
    } else {
      setCurrentIndex(currentIndex + 1);
      setFlipped(false);
      if (remembered) setRememberedCount(newRemembered);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>← Thoát</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {topic.icon} {topic.name}
        </Text>
        <Text style={styles.counter}>{currentIndex + 1}/{total}</Text>
      </View>

      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, {
          width: `${progress * 100}%`,
          backgroundColor: topic.color,
        }]} />
      </View>

      <View style={styles.cardArea}>
        <TouchableOpacity
          style={[styles.flashcard, { borderTopColor: topic.color }]}
          onPress={() => setFlipped(!flipped)}
          activeOpacity={0.9}
        >
          {!flipped ? (
            <View style={styles.cardInner}>
              <Text style={styles.langLabel}>Tiếng Anh</Text>
              <Text style={styles.englishWord}>{currentWord.english}</Text>
              <Text style={styles.pronunciation}>/{currentWord.pronunciation}/</Text>
              <Text style={styles.tapHint}>👆 Nhấn để xem nghĩa</Text>
            </View>
          ) : (
            <View style={styles.cardInner}>
              <Text style={styles.langLabel}>Tiếng Việt</Text>
              <Text style={styles.vietnameseWord}>{currentWord.vietnamese}</Text>
              <Text style={styles.englishSmall}>{currentWord.english}</Text>
            </View>
          )}
        </TouchableOpacity>

        {flipped && (
          <View style={styles.answerButtons}>
            <TouchableOpacity
              style={[styles.answerBtn, styles.btnForgot]}
              onPress={() => handleAnswer(false)}
            >
              <Text style={styles.answerBtnText}>✗ Chưa nhớ</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.answerBtn, styles.btnRemembered]}
              onPress={() => handleAnswer(true)}
            >
              <Text style={styles.answerBtnText}>✓ Nhớ rồi!</Text>
            </TouchableOpacity>
          </View>
        )}

        {!flipped && (
          <Text style={styles.helpText}>Hãy đọc từ, rồi nhấn thẻ để xem nghĩa</Text>
        )}
      </View>
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
  backButton: { width: 70 },
  backText: { fontSize: 16, color: '#3F51B5' },
  headerTitle: { fontSize: 17, fontWeight: 'bold', color: '#1a237e' },
  counter: { fontSize: 16, color: '#666', width: 50, textAlign: 'right' },
  progressBarBg: {
    height: 6,
    backgroundColor: '#e0e0e0',
  },
  progressBarFill: {
    height: 6,
    borderRadius: 3,
  },
  cardArea: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  flashcard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    borderTopWidth: 6,
    width: '100%',
    minHeight: 260,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    padding: 32,
  },
  cardInner: {
    alignItems: 'center',
    gap: 12,
  },
  langLabel: {
    fontSize: 13,
    color: '#aaa',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  englishWord: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#1a237e',
    textAlign: 'center',
  },
  pronunciation: {
    fontSize: 18,
    color: '#7986cb',
    fontStyle: 'italic',
  },
  tapHint: {
    fontSize: 14,
    color: '#bbb',
    marginTop: 16,
  },
  vietnameseWord: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2e7d32',
    textAlign: 'center',
  },
  englishSmall: {
    fontSize: 20,
    color: '#888',
  },
  answerButtons: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
  },
  answerBtn: {
    flex: 1,
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  btnForgot: {
    backgroundColor: '#ef5350',
    shadowColor: '#ef5350',
  },
  btnRemembered: {
    backgroundColor: '#43a047',
    shadowColor: '#43a047',
  },
  answerBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  helpText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});
