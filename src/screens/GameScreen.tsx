import { useState, useRef, useCallback, useEffect } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, SafeAreaView,
  Animated, PanResponder, Dimensions,
} from 'react-native';
import * as Speech from 'expo-speech';

function speak(text: string) {
  Speech.stop();
  Speech.speak(text, { language: 'en-US', rate: 0.85, pitch: 1.0 });
}
import { Topic, Word } from '../data/vocabulary';

const { width: SW } = Dimensions.get('window');
type Mode = 'flashcard' | 'quiz';
type Result = { wordIndex: number; correct: boolean };

type Props = {
  topic: Topic;
  topicIndex: number;
  allTopics: Topic[];
  skipReview?: boolean;
  onFinish: (results: Result[]) => void;
  onBack: () => void;
  onFailReview: () => void;
};

// --- REVIEW QUIZ CARD ---
function ReviewQuizCard({ word, pool, color, onAnswer }: {
  word: Word; pool: Word[]; color: string; onAnswer: (correct: boolean) => void;
}) {
  const [options] = useState<string[]>(() => {
    const wrong = pool
      .filter(w => w.vietnamese !== word.vietnamese)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(w => w.vietnamese);
    return [word.vietnamese, ...wrong].sort(() => Math.random() - 0.5);
  });
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    speak(word.english);
    return () => { Speech.stop(); };
  }, []);

  function pick(opt: string) {
    if (selected) return;
    setSelected(opt);
    setTimeout(() => onAnswer(opt === word.vietnamese), 650);
  }

  return (
    <View style={styles.quizContainer}>
      <View style={[styles.quizQuestion, { borderTopColor: color }]}>
        <Text style={styles.langLabel}>🔄 ÔN TẬP — Chọn nghĩa đúng</Text>
        <Text style={styles.englishWord}>{word.english}</Text>
        <Text style={styles.pronunciation}>/{word.pronunciation}/</Text>
        <TouchableOpacity style={styles.speakBtn} onPress={() => speak(word.english)}>
          <Text style={styles.speakBtnText}>🔊 Nghe lại</Text>
        </TouchableOpacity>
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

// --- REVIEW ROUND ---
function ReviewRound({ pool, topicColor, prevTopicName, onPass, onFail }: {
  pool: Word[];
  topicColor: string;
  prevTopicName: string;
  onPass: () => void;
  onFail: () => void;
}) {
  const [questions] = useState<Word[]>(() =>
    [...pool].sort(() => Math.random() - 0.5).slice(0, Math.min(3, pool.length))
  );
  const [currentQ, setCurrentQ] = useState(0);
  const correctRef = useRef(0);
  const [showResult, setShowResult] = useState(false);
  const [passed, setPassed] = useState(false);

  function handleAnswer(correct: boolean) {
    if (correct) correctRef.current += 1;
    if (currentQ + 1 >= questions.length) {
      const p = correctRef.current >= 2;
      setPassed(p);
      setShowResult(true);
      setTimeout(() => { if (p) onPass(); else onFail(); }, 1600);
    } else {
      setCurrentQ(q => q + 1);
    }
  }

  if (showResult) {
    return (
      <View style={styles.reviewResult}>
        <Text style={styles.reviewResultEmoji}>{passed ? '🎉' : '😅'}</Text>
        <Text style={styles.reviewResultTitle}>
          {passed ? 'Ôn tập tốt!' : 'Cần ôn lại...'}
        </Text>
        <Text style={styles.reviewResultScore}>
          Đúng {correctRef.current}/{questions.length} câu
        </Text>
        <Text style={styles.reviewResultSub}>
          {passed ? 'Tiếp tục học bài mới!' : `Hãy ôn lại "${prevTopicName}" nhé`}
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.reviewBanner}>
        <Text style={styles.reviewBannerText}>
          🔄 Ôn tập nhanh · Câu {currentQ + 1}/{questions.length}
        </Text>
        <Text style={styles.reviewBannerSub}>Đúng 2/3 để tiếp tục học</Text>
      </View>
      <ReviewQuizCard
        key={currentQ}
        word={questions[currentQ]}
        pool={pool}
        color={topicColor}
        onAnswer={handleAnswer}
      />
    </View>
  );
}

// --- SWIPE FLASHCARD ---
function SwipeCard({
  word, color, onAnswer,
}: { word: Word; color: string; onAnswer: (correct: boolean) => void }) {
  const pan = useRef(new Animated.ValueXY()).current;
  const flipAnim = useRef(new Animated.Value(0)).current;
  const flippedRef = useRef(false);
  const answeredRef = useRef(false);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    speak(word.english);
    return () => { Speech.stop(); };
  }, []);

  const frontRotate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const backRotate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] });
  const cardTilt = pan.x.interpolate({ inputRange: [-150, 0, 150], outputRange: ['-12deg', '0deg', '12deg'], extrapolate: 'clamp' });
  const greenOpacity = pan.x.interpolate({ inputRange: [0, 80], outputRange: [0, 1], extrapolate: 'clamp' });
  const redOpacity = pan.x.interpolate({ inputRange: [-80, 0], outputRange: [1, 0], extrapolate: 'clamp' });
  const upOpacity = pan.y.interpolate({ inputRange: [-80, 0], outputRange: [1, 0], extrapolate: 'clamp' });

  function flip() {
    flippedRef.current = true;
    setFlipped(true);
    Animated.spring(flipAnim, { toValue: 1, friction: 7, tension: 40, useNativeDriver: false }).start();
  }

  function exit(correct: boolean) {
    if (answeredRef.current) return;
    answeredRef.current = true;
    const toX = correct ? SW * 1.5 : -SW * 1.5;
    Animated.timing(pan.x, { toValue: toX, duration: 220, useNativeDriver: false }).start(() => onAnswer(correct));
  }

  const panResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gs) => {
      if (!flippedRef.current) {
        if (gs.dy < 0) pan.y.setValue(gs.dy);
      } else {
        pan.x.setValue(gs.dx);
      }
    },
    onPanResponderRelease: (_, gs) => {
      if (!flippedRef.current) {
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

      <Animated.View style={[
        styles.card, { borderTopColor: color },
        { transform: [{ translateX: pan.x }, { translateY: pan.y }, { rotate: cardTilt }, { perspective: 1000 }, { rotateY: frontRotate }] },
      ]}>
        <Animated.View style={[styles.overlay, styles.overlayGreen, { opacity: greenOpacity }]}>
          <Text style={styles.overlayText}>✓</Text>
        </Animated.View>
        <Animated.View style={[styles.overlay, styles.overlayRed, { opacity: redOpacity }]}>
          <Text style={styles.overlayText}>✗</Text>
        </Animated.View>
        <Text style={styles.langLabel}>TIẾNG ANH</Text>
        <Text style={styles.englishWord}>{word.english}</Text>
        <Text style={styles.pronunciation}>/{word.pronunciation}/</Text>
        <TouchableOpacity style={styles.speakBtn} onPress={() => speak(word.english)}>
          <Text style={styles.speakBtnText}>🔊 Nghe lại</Text>
        </TouchableOpacity>
        <View style={styles.tapHintBox}>
          <Text style={styles.tapHintText}>👆 Vuốt lên để xem nghĩa</Text>
        </View>
      </Animated.View>

      <Animated.View style={[
        styles.card, styles.cardBack, { borderTopColor: color },
        { transform: [{ translateX: pan.x }, { translateY: pan.y }, { rotate: cardTilt }, { perspective: 1000 }, { rotateY: backRotate }] },
      ]}>
        <Animated.View style={[styles.overlay, styles.overlayGreen, { opacity: greenOpacity }]}>
          <Text style={styles.overlayText}>✓</Text>
        </Animated.View>
        <Animated.View style={[styles.overlay, styles.overlayRed, { opacity: redOpacity }]}>
          <Text style={styles.overlayText}>✗</Text>
        </Animated.View>
        <Text style={styles.langLabel}>TIẾNG VIỆT</Text>
        <Text style={styles.vietnameseWord}>{word.vietnamese}</Text>
        <Text style={styles.englishSmall}>{word.english}</Text>
        {word.example && (
          <View style={styles.exampleBox}>
            <Text style={styles.exampleEn}>"{word.example.en}"</Text>
            <Text style={styles.exampleVi}>{word.example.vi}</Text>
          </View>
        )}
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

  useEffect(() => {
    speak(word.english);
    return () => { Speech.stop(); };
  }, []);

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
        <TouchableOpacity style={styles.speakBtn} onPress={() => speak(word.english)}>
          <Text style={styles.speakBtnText}>🔊 Nghe lại</Text>
        </TouchableOpacity>
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

export default function GameScreen({ topic, topicIndex, allTopics, skipReview, onFinish, onBack, onFailReview }: Props) {
  const [reviewDone, setReviewDone] = useState(topicIndex === 0 || !!skipReview);
  const [mode, setMode] = useState<Mode | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<Result[]>([]);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const total = topic.words.length;
  const reviewPool = allTopics.slice(0, topicIndex).flatMap(t => t.words);
  const prevTopicName = topicIndex > 0 ? allTopics[topicIndex - 1].name : '';

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

  // --- REVIEW PHASE ---
  if (!reviewDone) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack}><Text style={styles.backText}>‹ Thoát</Text></TouchableOpacity>
          <Text style={styles.headerTitle}>🔄 Ôn tập</Text>
          <View style={{ width: 60 }} />
        </View>
        <View style={styles.cardWrapper}>
          <ReviewRound
            pool={reviewPool}
            topicColor={topic.color}
            prevTopicName={prevTopicName}
            onPass={() => setReviewDone(true)}
            onFail={onFailReview}
          />
        </View>
      </SafeAreaView>
    );
  }

  // --- MODE SELECT ---
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

  // --- PLAYING ---
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
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#DDE9F5',
  },
  backText: { fontSize: 17, color: '#A527FF', fontWeight: '600', width: 60 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#1274C6', flex: 1, textAlign: 'center' },
  counter: { fontSize: 14, color: '#888', width: 45, textAlign: 'right' },
  progressBarBg: { height: 5, backgroundColor: '#EDF4FF' },
  progressBarFill: { height: 5 },
  cardWrapper: { flex: 1, padding: 20 },

  // Review
  reviewBanner: {
    backgroundColor: '#FFF8E1', borderRadius: 14, padding: 14,
    marginBottom: 16, alignItems: 'center', gap: 4,
    borderWidth: 1, borderColor: '#FFE082',
  },
  reviewBannerText: { fontSize: 15, fontWeight: '700', color: '#F9A825' },
  reviewBannerSub: { fontSize: 12, color: '#BFA040' },
  reviewResult: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  reviewResultEmoji: { fontSize: 72 },
  reviewResultTitle: { fontSize: 26, fontWeight: '800', color: '#1274C6' },
  reviewResultScore: { fontSize: 20, fontWeight: '700', color: '#444' },
  reviewResultSub: { fontSize: 14, color: '#999', textAlign: 'center' },

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
  englishWord: { fontSize: 46, fontFamily: 'BlancInline', color: '#1274C6', textAlign: 'center' },
  pronunciation: { fontSize: 16, color: '#64ADEC', fontStyle: 'italic' },
  speakBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 18, paddingVertical: 8,
    backgroundColor: '#EDF5FF', borderRadius: 20,
    borderWidth: 1, borderColor: '#B8D9F5',
  },
  speakBtnText: { fontSize: 14, color: '#1274C6', fontWeight: '600' },
  tapHintBox: { marginTop: 8, paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#EDF4FF', borderRadius: 20 },
  tapHintText: { fontSize: 13, color: '#AAA' },
  vietnameseWord: { fontSize: 36, fontWeight: '800', color: '#00B894', textAlign: 'center' },
  englishSmall: { fontSize: 18, color: '#AAA' },
  exampleBox: {
    backgroundColor: '#F8F4FF', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 10,
    borderLeftWidth: 3, borderLeftColor: '#A527FF', gap: 4, width: '100%',
  },
  exampleEn: { fontSize: 13, color: '#555', fontStyle: 'italic', lineHeight: 18 },
  exampleVi: { fontSize: 12, color: '#A527FF', fontWeight: '600' },
  swipeInstructions: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 8 },
  swipeInstLeft: { fontSize: 13, color: '#FF6B6B', fontWeight: '600' },
  swipeInstRight: { fontSize: 13, color: '#00C896', fontWeight: '600' },

  swipeHint: { position: 'absolute', zIndex: 10, alignItems: 'center' },
  swipeHintUp: { top: -36, alignSelf: 'center', width: '100%' },
  swipeHintLeft: { left: -10, top: '40%' },
  swipeHintRight: { right: -10, top: '40%' },
  swipeHintText: { fontSize: 14, fontWeight: '700', color: '#A527FF' },

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
  modeTitle: { fontSize: 22, fontWeight: '800', color: '#1274C6', textAlign: 'center', marginBottom: 8 },
  modeCard: {
    backgroundColor: '#fff', borderRadius: 20, padding: 24,
    alignItems: 'center', gap: 8, borderWidth: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
  },
  modeIcon: { fontSize: 40 },
  modeName: { fontSize: 20, fontWeight: '800', color: '#1274C6' },
  modeDesc: { fontSize: 13, color: '#888', textAlign: 'center' },
});
