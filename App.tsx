import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Topic } from './src/data/vocabulary';
import HomeScreen from './src/screens/HomeScreen';
import TopicsScreen from './src/screens/TopicsScreen';
import GameScreen from './src/screens/GameScreen';
import ResultsScreen from './src/screens/ResultsScreen';

type Screen = 'home' | 'topics' | 'game' | 'results';

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [gameResult, setGameResult] = useState({ remembered: 0, total: 0 });

  function handleSelectTopic(topic: Topic) {
    setSelectedTopic(topic);
    setScreen('game');
  }

  function handleFinishGame(remembered: number, total: number) {
    setGameResult({ remembered, total });
    setScreen('results');
  }

  function handleRetry() {
    setScreen('game');
  }

  return (
    <>
      <StatusBar style="dark" />
      {screen === 'home' && (
        <HomeScreen onStart={() => setScreen('topics')} />
      )}
      {screen === 'topics' && (
        <TopicsScreen
          onSelectTopic={handleSelectTopic}
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
          remembered={gameResult.remembered}
          total={gameResult.total}
          onRetry={handleRetry}
          onHome={() => setScreen('home')}
        />
      )}
    </>
  );
}
