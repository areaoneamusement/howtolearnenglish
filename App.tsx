import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Topic } from './src/data/vocabulary';
import { useProgress } from './src/hooks/useProgress';
import HomeScreen from './src/screens/HomeScreen';
import TopicsScreen from './src/screens/TopicsScreen';
import GameScreen from './src/screens/GameScreen';
import ResultsScreen from './src/screens/ResultsScreen';

type Screen = 'home' | 'topics' | 'game' | 'results';
type GameResult = { wordIndex: number; correct: boolean };

export default function App() {
  const { progress, loaded, recordStudySession } = useProgress();
  const [screen, setScreen] = useState<Screen>('home');
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [lastResults, setLastResults] = useState<GameResult[]>([]);
  const [lastXpGained, setLastXpGained] = useState(0);

  if (!loaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  async function handleFinishGame(results: GameResult[]) {
    if (!selectedTopic) return;
    const xp = await recordStudySession(selectedTopic.id, results);
    setLastResults(results);
    setLastXpGained(xp);
    setScreen('results');
  }

  return (
    <>
      <StatusBar style="dark" />
      {screen === 'home' && (
        <HomeScreen
          onStart={() => setScreen('topics')}
          progress={progress}
        />
      )}
      {screen === 'topics' && (
        <TopicsScreen
          onSelectTopic={(topic) => { setSelectedTopic(topic); setScreen('game'); }}
          onBack={() => setScreen('home')}
        />
      )}
      {screen === 'game' && selectedTopic && (
        <GameScreen
          topic={selectedTopic}
          onFinish={handleFinishGame}
          onBack={() => setScreen('topics')}
        />
      )}
      {screen === 'results' && selectedTopic && (
        <ResultsScreen
          topic={selectedTopic}
          results={lastResults}
          xpGained={lastXpGained}
          streak={progress.streak}
          onRetry={() => setScreen('game')}
          onHome={() => setScreen('home')}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8F9FF' },
});
