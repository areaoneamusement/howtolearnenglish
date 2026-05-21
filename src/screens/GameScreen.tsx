import { useState, useRef, useCallback } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, SafeAreaView,
  Animated, PanResponder, Dimensions,
} from 'react-native';
import { Topic, Word } from '../data/vocabulary';

const { width: SW } = Dimensions.get('window');
type Mode = 'flashcard' | 'quiz';
type Result = { wordIndex: number; correct: boolean };

type Props = {
  topic: Topic;
  onFinish: (results: Result[]) => void;
  onBack: () => void;
};

// --- SWIPE FLASHCARD ---
function SwipeCard({
  word, color, onAnswer,
}: { word: Word; color: string; onAnswer: (correct: boolean) => void }) {
  const pan = useRef(new Animated.ValueXY()).current;
  const flipAnim = useRef(new Animated.Value(0)).current;
  const [flipped, setFlipped] = useState(false);
  const [answered, setAnswered] = useState(false);

  const frontRotate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const backRotate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] });
  const cardTilt = pan.x.interpolate({ inputRange: [-150, 0, 150], outputRange: ['-12deg', '0deg', '12deg'], extrapolate: 'clamp' });
  const greenOpacity = pan.x.interpolate({ inputRange: [0, 80], outputRange: [0, 1], extrapolate: 'clamp' });
  const redOpacity = pan.x.interpolate({ inputRange: [-80, 0], outputRange: [1, 0], extrapolate: 'clamp' });
  const upOpacity = pan.y.interpolate({ inputRange: [-80, 0], outputRange: [1, 0], extrapolate: 'clamp' });

  function flip() {
    setFlipped(true);
    Animated.spring(flipAnim, { toValue: 1, friction: 7, tension: 40, useNativeDriver: true }).start();
  }

  function exit(correct: boolean) {
    if (answered) return;
    setAnswered(true);
    const toX = correct ? SW * 1.5 : -SW * 1.5;
    Animated.timing(pan.x, { toValue: toX, duration: 220, useNativeDriver: false }).start(() => onAnswer(correct));
  }

  const panResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gs) => {
      if (!flipped) {
        if (gs.dy < 0) pan.y.setValue(gs.dy);
      } else {
        pan.x.setValue(gs.dx);
      }
    },
    onPanResponderRelease: (_, gs) => {
      if (!flipped) {
        if (gs.dy < -55) {
          Animated.spring(pan.y, { toValue: 0, useNativeDriver: false }).start();
          flip();
        } else {
          Animated.spring(pan.y, { toValue: 0, useNativeDriver: false }).start();
        }
      } else {
        if (gs.dx > 100)       exit(true);
        else if (gs.dx < -100) exit(false);
        else Animated.spring(pan.x, { toValue: 0, useNativeDriver: false }).start();
      }
    },
  })).current;

  return (
    <View style={styles.swipeArea} {...panResponder.panHandlers}>
      {/* Hints */}
      {!flipped && (
        <Animated.View style={[styles.swipeHint, styles.swipeHintUp, { opacity: upOpacity }]}>
          <Text style={styles.swipeHintText}>👆 Vuốt lên để xem nghĩa</Text>
        </Animated.View>
      )}
      {flipped && (
        <>
          <Animated.View style={[styles.swipeHint, styles.swipeHintRight, { opacity: greenOpacity }]}>
            <Text style={[styles.swipeHintText, { color: '#00C896' }]}>✓  Nhớ rồi!</Text>
          </Animated.View>
          <Animated.View style={[styles.swipeHint, styles.swipeHintLeft, { opacity: redOpacity }]}>
            <Text style={[styles.swipeHintText, { color: '#FF6B6B' }]}>✗  Chưa nhớ</Text>
          </Animated.View>
        </>
      )}

      {/* Card front */}
      <Animated.View style={[
        styles.card, { borderTopColor: color },
        { transform: [{ translateX: pan.x }, { translateY: pan.y }, { rotate: cardTilt }, { perspective: 1000 }, { rotateY: frontRotate }] },
      ]}>
        {/* Green overlay */}
        <Animated.View style={[styles.overlay, styles.overlayGreen, { opacity: greenOpacity }]}>
          <Text style={styles.overlayText}>✓</Text>
        </Animated.View>
        {/* Red overlay */}
        <Animated.View style={[styles.overlay, styles.overlayRed, { opacity: redOpacity }]}>
          <Text style={styles.overlayText}>✗</Text>
        </Animated.View>

        <Text style={styles.langLabel}>TIẾNG ANH</Text>
        <Text style={styles.englishWord}>{word.english}</Text>
        <Text style={styles.pronunciation}>/{word.pronunciation}/</Text>
        <View style={styles.tapHintBox}>
          <Text style={styles.tapHintText}>👆 Vuốt lên để xem nghĩa</Text>
        </View>
      </Animated.View>

      {/* Card back */}
      <Animated.View style={[
        styles.card, styles.cardBack, { borderTopColor: color },
        { transform: [{ translateX: pan.x }, { translateY: pan.y }, { rotate: cardTilt }, { perspective: 1000 }, { rotateY: backRotate }] },
      ]}>
        {/* Green overlay */}
        <Animated.View style={[styles.overlay, styles.overlayGreen, { opacity: greenOpacity }]}>
          <Text style={styles.overlayText}>✓</Text>
        </Animated.View>
        {/* Red overlay */}
        <Animated.View style={[styles.overlay, styles.overlayRed, { opacity: redOpacity }]}>
          <Text style={styles.overlayText}>✗</Text>
        </Animated.View>

        <Text style={styles.langLabel}>TIẾNG VIỆT</Text>
        <Text style={styles.vietnameseWord}>{word.vietnamese}</Text>
        <Text style={styles.englishSmall}>{word.english}</Text>
        <View style={styles.swipeInstructions}>
          <Text style={styles.swipeInstLeft}>← Chưa nhớ</Text>
          <Text style={styles.swipeInstRight}>Nhớ rồi →</Text>
        </View>
      </Animated.View>
    </View>
  );
}

// --- QUIZ ---
function QuizCard({ word, words, wordIndex, color, onAnswer }: {
  word: Word; words: Word[]; wordIndex: number;
  color: string; onAnswer: (correct: boolean) => void;
}) {
  const pool = words.filter((_, i) => i !== wordIndex).sort(() => Math.random() - 0.5).slice(0, 3);
  const options = [word.vietnamese, ...pool.map(w => w.vietnamese)].sort(() => Math.random() - 0.5);
  const [selected, setSelected] = useState<string | null>(null);

  function pick(opt: string) {
    if (selected) return;
    setSelected(opt);
    setTimeout(() => onAnswer(opt === word.vietnamese), 650);
  }

  return (
    <View style={styles.quizContainer}>
      <View style={[styles.quizQuestion, { borderTopColor: color }]}>
        <Text style={styles.langLabel}>TIẾNG ANH — Chọn nghĩa đúng</Text>
        <Text style={styles.englishWord}>{word.english}</Text>
        <Text style={styles.pronunciation}>/{word.pronunciation}/</Text>
      </View>
      <View style={styles.optionsList}>
        {options.map((opt, i) => {
          const isCorrect = opt === word.vietnamese;
          const isSelected = opt === selected;
          return (
            <TouchableOpacity
              key={i} onPress={() => pick(opt)} activeOpacity={0.8}
              style={[
                styles.option,
                !selected && styles.optionDefault,
                selected && isCorrect && styles.optionCorrect,
                selected && isSelected && !isCorrect && styles.optionWrong,
                selected && !isSelected && !isCorrect && styles.optionFaded,
              ]}
            >
              <Text style={[
                styles.optionText,
                selected && isCorrect && styles.optionTextCorrect,
                selected && isSelected && !isCorrect && styles.optionTextWrong,
              ]}>{opt}</Text>
            </TouchableOpacity>
          );
        })}
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

  const handleAnswer = useCallback((correct: boolean) => {
    const newResults = [...results, { wordIndex: currentIndex, correct }];
    Animated.timing(slideAnim, { toValue: -SW, duration: 180, useNativeDriver: false }).start(() => {
      if (currentIndex + 1 >= total) {
        onFinish(newResults);
      } else {
        setResults(newResults);
        setCurrentIndex(i => i + 1);
        slideAnim.setValue(SW);
        Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 60, useNativeDriver: false }).start();
      }
    });
  }, [results, currentIndex, total, onFinish]);

  if (!mode) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack}><Text style={styles.backText}>‹ Thoát</Text></TouchableOpacity>
          <Text style={styles.headerTitle}>{topic.icon} {topic.name}</Text>
          <View style={{ width: 60 }} />
        </View>
        <View style={styles.modeScreen}>
          <Text style={styles.modeTitle}>Chọn cách học</Text>
          <TouchableOpacity style={[styles.modeCard, { borderColor: topic.color }]} onPress={() => setMode('flashcard')} activeOpacity={0.85}>
            <Text style={styles.modeIcon}>🃏</Text>
            <Text style={styles.modeName}>Thẻ ghi nhớ</Text>
            <Text style={styles.modeDesc}>Vuốt lên lật thẻ · Vuốt phải/trái để đánh giá</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.modeCard, { borderColor: topic.color }]} onPress={() => setMode('quiz')} activeOpacity={0.85}>
            <Text style={styles.modeIcon}>🎯</Text>
            <Text style={styles.modeName}>Trắc nghiệm</Text>
            <Text style={styles.modeDesc}>Chọn đúng nghĩa tiếng Việt trong 4 đáp án</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}><Text style={styles.backText}>‹ Thoát</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>{topic.icon} {topic.name}</Text>
        <Text style={styles.counter}>{currentIndex + 1}/{total}</Text>
      </View>

      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, {
          width: `${(currentIndex / total) * 100}%`,
          backgroundColor: topic.color,
        }]} />
      </View>

      <Animated.View style={[styles.cardWrapper, { transform: [{ translateX: slideAnim }] }]}>
        {mode === 'flashcard' ? (
          <SwipeCard key={currentIndex} word={topic.words[currentIndex]} color={topic.color} onAnswer={handleAnswer} />
        ) : (
          <QuizCard key={currentIndex} word={topic.words[currentIndex]} words={topic.words} wordIndex={currentIndex} color={topic.color} onAnswer={handleAnswer} />
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
  backText: { fontSize: 17, color: '#7B2FBE', fontWeight: '600', width: 60 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#2D3A8C', flex: 1, textAlign: 'center' },
  counter: { fontSize: 14, color: '#888', width: 45, textAlign: 'right' },
  progressBarBg: { height: 5, backgroundColor: '#E8EAFF' },
  progressBarFill: { height: 5 },

  cardWrapper: { flex: 1, padding: 20 },

  // Swipe card
  swipeArea: { flex: 1 },
  card: {
    position: 'absolute', width: '100%', height: '100%',
    backgroundColor: '#fff', borderRadius: 24, borderTopWidth: 6,
    backfaceVisibility: 'hidden', overflow: 'hidden',
    alignItems: 'center', justifyContent: 'center', padding: 28,
    gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1, shadowRadius: 16, elevation: 8,
  },
  cardBack: {},
  overlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center', borderRadius: 18,
  },
  overlayGreen: { backgroundColor: '#00C89620' },
  overlayRed: { backgroundColor: '#FF6B6B20' },
  overlayText: { fontSize: 80, opacity: 0.8 },
  langLabel: { fontSize: 11, color: '#CCC', letterSpacing: 2, fontWeight: '600' },
  englishWord: { fontSize: 46, fontWeight: '800', color: '#2D3A8C', textAlign: 'center' },
  pronunciation: { fontSize: 16, color: '#9B97DC', fontStyle: 'italic' },
  tapHintBox: { marginTop: 16, paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#F0F1FF', borderRadius: 20 },
  tapHintText: { fontSize: 13, color: '#AAA' },
  vietnameseWord: { fontSize: 36, fontWeight: '800', color: '#00B894', textAlign: 'center' },
  englishSmall: { fontSize: 18, color: '#AAA' },
  swipeInstructions: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 16 },
  swipeInstLeft: { fontSize: 13, color: '#FF6B6B', fontWeight: '600' },
  swipeInstRight: { fontSize: 13, color: '#00C896', fontWeight: '600' },

  swipeHint: { position: 'absolute', zIndex: 10, alignItems: 'center' },
  swipeHintUp: { top: -36, alignSelf: 'center', width: '100%' },
  swipeHintLeft: { left: -10, top: '40%' },
  swipeHintRight: { right: -10, top: '40%' },
  swipeHintText: { fontSize: 14, fontWeight: '700', color: '#7B2FBE' },

  // Quiz
  quizContainer: { flex: 1, gap: 16 },
  quizQuestion: {
    backgroundColor: '#fff', borderRadius: 24, borderTopWidth: 6,
    padding: 24, alignItems: 'center', gap: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 5,
  },
  optionsList: { gap: 10 },
  option: { padding: 18, borderRadius: 16, borderWidth: 2, alignItems: 'center' },
  optionDefault: { backgroundColor: '#fff', borderColor: '#E8EAFF' },
  optionCorrect: { backgroundColor: '#E8FFF8', borderColor: '#4ECDC4' },
  optionWrong: { backgroundColor: '#FFF0F0', borderColor: '#FF6B6B' },
  optionFaded: { backgroundColor: '#fff', borderColor: '#EEE', opacity: 0.5 },
  optionText: { fontSize: 16, fontWeight: '600', color: '#444' },
  optionTextCorrect: { color: '#00B894' },
  optionTextWrong: { color: '#FF6B6B' },

  // Mode select
  modeScreen: { flex: 1, padding: 24, justifyContent: 'center', gap: 20 },
  modeTitle: { fontSize: 22, fontWeight: '800', color: '#2D3A8C', textAlign: 'center', marginBottom: 8 },
  modeCard: {
    backgroundColor: '#fff', borderRadius: 20, padding: 24,
    alignItems: 'center', gap: 8, borderWidth: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
  },
  modeIcon: { fontSize: 40 },
  modeName: { fontSize: 20, fontWeight: '800', color: '#2D3A8C' },
  modeDesc: { fontSize: 13, color: '#888', textAlign: 'center' },
});
