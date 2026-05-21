import { useState, useRef, useCallback } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity,
  SafeAreaView, Animated, Dimensions,
} from 'react-native';
import { Topic, Word } from '../data/vocabulary';

const { width } = Dimensions.get('window');

type Mode = 'flashcard' | 'quiz';
type Result = { wordIndex: number; correct: boolean };

type Props = {
  topic: Topic;
  onFinish: (results: Result[]) => void;
  onBack: () => void;
};

// Sinh 3 đáp án sai ngẫu nhiên từ cùng topic
function getWrongOptions(words: Word[], correctIndex: number): string[] {
  const pool = words
    .map((w, i) => ({ v: w.vietnamese, i }))
    .filter(x => x.i !== correctIndex);
  const shuffled = pool.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3).map(x => x.v);
}

function FlipCard({
  word, color, onAnswer,
}: {
  word: Word; color: string; onAnswer: (correct: boolean) => void;
}) {
  const flipAnim = useRef(new Animated.Value(0)).current;
  const [flipped, setFlipped] = useState(false);
  const [answered, setAnswered] = useState(false);

  const frontRotate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const backRotate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] });

  function flip() {
    if (flipped) return;
    setFlipped(true);
    Animated.spring(flipAnim, {
      toValue: 1, friction: 7, tension: 40, useNativeDriver: true,
    }).start();
  }

  function handleAnswer(correct: boolean) {
    if (answered) return;
    setAnswered(true);
    setTimeout(() => onAnswer(correct), 200);
  }

  return (
    <View style={styles.flipContainer}>
      {/* Mặt trước */}
      <Animated.View style={[
        styles.card, styles.cardFront,
        { borderTopColor: color, transform: [{ perspective: 1000 }, { rotateY: frontRotate }] },
      ]}>
        <TouchableOpacity style={styles.cardTouchable} onPress={flip} activeOpacity={0.9}>
          <Text style={styles.langLabel}>TIẾNG ANH</Text>
          <Text style={styles.englishWord}>{word.english}</Text>
          <Text style={styles.pronunciation}>/{word.pronunciation}/</Text>
          <View style={styles.tapHintBox}>
            <Text style={styles.tapHint}>👆 Nhấn để xem nghĩa</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* Mặt sau */}
      <Animated.View style={[
        styles.card, styles.cardBack,
        { borderTopColor: color, transform: [{ perspective: 1000 }, { rotateY: backRotate }] },
      ]}>
        <View style={styles.cardTouchable}>
          <Text style={styles.langLabel}>TIẾNG VIỆT</Text>
          <Text style={styles.vietnameseWord}>{word.vietnamese}</Text>
          <Text style={styles.englishSmall}>{word.english}</Text>

          {!answered && (
            <View style={styles.answerButtons}>
              <TouchableOpacity
                style={[styles.answerBtn, styles.btnForgot]}
                onPress={() => handleAnswer(false)}
                activeOpacity={0.85}
              >
                <Text style={styles.answerBtnText}>✗  Chưa nhớ</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.answerBtn, styles.btnKnown]}
                onPress={() => handleAnswer(true)}
                activeOpacity={0.85}
              >
                <Text style={styles.answerBtnText}>✓  Nhớ rồi!</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Animated.View>
    </View>
  );
}

function QuizCard({
  word, words, wordIndex, color, onAnswer,
}: {
  word: Word; words: Word[]; wordIndex: number;
  color: string; onAnswer: (correct: boolean) => void;
}) {
  const wrongOptions = getWrongOptions(words, wordIndex);
  const options = [word.vietnamese, ...wrongOptions].sort(() => Math.random() - 0.5);
  const [selected, setSelected] = useState<string | null>(null);

  function handleSelect(option: string) {
    if (selected) return;
    setSelected(option);
    const correct = option === word.vietnamese;
    setTimeout(() => onAnswer(correct), 700);
  }

  function optionStyle(option: string) {
    if (!selected) return styles.optionDefault;
    if (option === word.vietnamese) return styles.optionCorrect;
    if (option === selected) return styles.optionWrong;
    return styles.optionDefault;
  }

  return (
    <View style={styles.quizContainer}>
      <View style={[styles.quizQuestion, { borderTopColor: color }]}>
        <Text style={styles.langLabel}>TIẾNG ANH — Nghĩa của từ này là gì?</Text>
        <Text style={styles.englishWord}>{word.english}</Text>
        <Text style={styles.pronunciation}>/{word.pronunciation}/</Text>
      </View>
      <View style={styles.optionsGrid}>
        {options.map((option, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.option, optionStyle(option)]}
            onPress={() => handleSelect(option)}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.optionText,
              selected && option === word.vietnamese && styles.optionTextCorrect,
              selected && option === selected && option !== word.vietnamese && styles.optionTextWrong,
            ]}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export default function GameScreen({ topic, onFinish, onBack }: Props) {
  const [mode, setMode] = useState<Mode | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<Result[]>([]);

  const slideAnim = useRef(new Animated.Value(0)).current;

  const total = topic.words.length;
  const progress = currentIndex / total;

  const handleAnswer = useCallback((correct: boolean) => {
    const newResults = [...results, { wordIndex: currentIndex, correct }];

    Animated.sequence([
      Animated.timing(slideAnim, { toValue: -width, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      if (currentIndex + 1 >= total) {
        onFinish(newResults);
      } else {
        setResults(newResults);
        setCurrentIndex(currentIndex + 1);
        slideAnim.setValue(width);
        Animated.spring(slideAnim, {
          toValue: 0, friction: 8, tension: 60, useNativeDriver: true,
        }).start();
      }
    });
  }, [results, currentIndex, total, onFinish, slideAnim]);

  // Màn chọn chế độ
  if (!mode) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backText}>‹ Thoát</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{topic.icon} {topic.name}</Text>
          <View style={{ width: 60 }} />
        </View>
        <View style={styles.modeSelection}>
          <Text style={styles.modeTitle}>Chọn cách học</Text>
          <TouchableOpacity
            style={[styles.modeCard, { borderColor: topic.color }]}
            onPress={() => setMode('flashcard')}
            activeOpacity={0.85}
          >
            <Text style={styles.modeIcon}>🃏</Text>
            <Text style={styles.modeName}>Thẻ ghi nhớ</Text>
            <Text style={styles.modeDesc}>Lật thẻ xem nghĩa, đánh dấu nhớ/chưa nhớ</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeCard, { borderColor: topic.color }]}
            onPress={() => setMode('quiz')}
            activeOpacity={0.85}
          >
            <Text style={styles.modeIcon}>🎯</Text>
            <Text style={styles.modeName}>Trắc nghiệm</Text>
            <Text style={styles.modeDesc}>Chọn đúng nghĩa tiếng Việt trong 4 đáp án</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentWord = topic.words[currentIndex];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>‹ Thoát</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{topic.icon} {topic.name}</Text>
        <Text style={styles.counter}>{currentIndex + 1}/{total}</Text>
      </View>

      <View style={styles.progressBarBg}>
        <Animated.View style={[styles.progressBarFill, {
          width: `${progress * 100}%`,
          backgroundColor: topic.color,
        }]} />
      </View>

      <View style={styles.modeTag}>
        <Text style={styles.modeTagText}>
          {mode === 'flashcard' ? '🃏 Thẻ ghi nhớ' : '🎯 Trắc nghiệm'}
        </Text>
      </View>

      <Animated.View style={[styles.cardWrapper, { transform: [{ translateX: slideAnim }] }]}>
        {mode === 'flashcard' ? (
          <FlipCard
            key={currentIndex}
            word={currentWord}
            color={topic.color}
            onAnswer={handleAnswer}
          />
        ) : (
          <QuizCard
            key={currentIndex}
            word={currentWord}
            words={topic.words}
            wordIndex={currentIndex}
            color={topic.color}
            onAnswer={handleAnswer}
          />
        )}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FF' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#ECEDF8',
  },
  backButton: { width: 60 },
  backText: { fontSize: 17, color: '#6C63FF', fontWeight: '600' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#2D3A8C', flex: 1, textAlign: 'center' },
  counter: { fontSize: 15, color: '#888', width: 45, textAlign: 'right' },
  progressBarBg: { height: 5, backgroundColor: '#E8EAFF' },
  progressBarFill: { height: 5 },
  modeTag: { alignItems: 'center', paddingVertical: 8 },
  modeTagText: { fontSize: 13, color: '#AAA' },
  cardWrapper: { flex: 1, paddingHorizontal: 20, paddingBottom: 20 },

  // Flip card
  flipContainer: { flex: 1 },
  card: {
    position: 'absolute', width: '100%', height: '100%',
    backgroundColor: '#fff', borderRadius: 24, borderTopWidth: 6,
    backfaceVisibility: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1, shadowRadius: 16, elevation: 8,
  },
  cardFront: {},
  cardBack: {},
  cardTouchable: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    padding: 28, gap: 12,
  },
  langLabel: { fontSize: 11, color: '#CCC', letterSpacing: 2, fontWeight: '600' },
  englishWord: {
    fontSize: 48, fontWeight: '800', color: '#2D3A8C',
    textAlign: 'center', lineHeight: 56,
  },
  pronunciation: { fontSize: 17, color: '#9B97DC', fontStyle: 'italic' },
  tapHintBox: {
    marginTop: 20, paddingHorizontal: 20, paddingVertical: 10,
    backgroundColor: '#F0F1FF', borderRadius: 20,
  },
  tapHint: { fontSize: 14, color: '#AAA' },
  vietnameseWord: {
    fontSize: 38, fontWeight: '800', color: '#00B894',
    textAlign: 'center',
  },
  englishSmall: { fontSize: 18, color: '#AAA' },
  answerButtons: { flexDirection: 'row', gap: 12, marginTop: 20, width: '100%' },
  answerBtn: {
    flex: 1, paddingVertical: 16, borderRadius: 16, alignItems: 'center',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  btnForgot: { backgroundColor: '#FF6B6B', shadowColor: '#FF6B6B' },
  btnKnown: { backgroundColor: '#4ECDC4', shadowColor: '#4ECDC4' },
  answerBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  // Quiz
  quizContainer: { flex: 1, gap: 16 },
  quizQuestion: {
    backgroundColor: '#fff', borderRadius: 24, borderTopWidth: 6,
    padding: 28, alignItems: 'center', gap: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 5,
  },
  optionsGrid: { gap: 10 },
  option: {
    padding: 18, borderRadius: 16, borderWidth: 2,
    alignItems: 'center',
  },
  optionDefault: { backgroundColor: '#fff', borderColor: '#E8EAFF' },
  optionCorrect: { backgroundColor: '#E8FFF8', borderColor: '#4ECDC4' },
  optionWrong: { backgroundColor: '#FFF0F0', borderColor: '#FF6B6B' },
  optionText: { fontSize: 17, fontWeight: '600', color: '#444' },
  optionTextCorrect: { color: '#00B894' },
  optionTextWrong: { color: '#FF6B6B' },

  // Mode selection
  modeSelection: {
    flex: 1, padding: 24, justifyContent: 'center', gap: 20,
  },
  modeTitle: {
    fontSize: 22, fontWeight: '800', color: '#2D3A8C', textAlign: 'center', marginBottom: 8,
  },
  modeCard: {
    backgroundColor: '#fff', borderRadius: 20, padding: 24,
    alignItems: 'center', gap: 8, borderWidth: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
  },
  modeIcon: { fontSize: 40 },
  modeName: { fontSize: 20, fontWeight: '800', color: '#2D3A8C' },
  modeDesc: { fontSize: 14, color: '#888', textAlign: 'center' },
});
