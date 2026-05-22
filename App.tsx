import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useFonts } from 'expo-font';

import { Topic, topics } from './src/data/vocabulary';
import { useProgress } from './src/hooks/useProgress';
import BottomNav, { TabName } from './src/components/BottomNav';

import HomeMapScreen from './src/screens/HomeMapScreen';
import ActivityScreen from './src/screens/ActivityScreen';
import LeaderboardScreen from './src/screens/LeaderboardScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import GameScreen from './src/screens/GameScreen';
import ResultsScreen from './src/screens/ResultsScreen';

type GameResult = { wordIndex: number; correct: boolean };
type AppView = 'tabs' | 'game' | 'results';

export default function App() {
  const { progress, loaded, recordStudySession } = useProgress();
  const [tab, setTab] = useState<TabName>('home');
  const [view, setView] = useState<AppView>('tabs');
  const [activeTopic, setActiveTopic] = useState<Topic | null>(null);
  const [lastResults, setLastResults] = useState<GameResult[]>([]);
  const [lastXp, setLastXp] = useState(0);
  const [skipReview, setSkipReview] = useState(false);

  const [fontsLoaded] = useFonts({
    Nikoovers: require('./assets/fonts/Nikoovers.ttf'),
    MontserratLight: require('./assets/fonts/MontserratLight.otf'),
    BlancInline: require('./assets/fonts/BlancInline.ttf'),
  });

  if (!loaded || !fontsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#A527FF" />
      </View>
    );
  }

  const topicIndex = activeTopic ? topics.findIndex(t => t.id === activeTopic.id) : 0;

  async function handleFinishGame(results: GameResult[]) {
    if (!activeTopic) return;
    const xp = await recordStudySession(activeTopic.id, results);
    setLastResults(results);
    setLastXp(xp);
    setSkipReview(false);
    setView('results');
  }

  function handleFailReview() {
    if (!activeTopic) return;
    const idx = topics.findIndex(t => t.id === activeTopic.id);
    if (idx > 0) {
      setActiveTopic(topics[idx - 1]);
      setSkipReview(true);
    } else {
      setView('tabs');
    }
  }

  if (view === 'game' && activeTopic) {
    return (
      <>
        <StatusBar style="dark" />
        <GameScreen
          topic={activeTopic}
          topicIndex={topicIndex}
          allTopics={topics}
          skipReview={skipReview}
          onFinish={handleFinishGame}
          onBack={() => { setSkipReview(false); setView('tabs'); }}
          onFailReview={handleFailReview}
        />
      </>
    );
  }

  if (view === 'results' && activeTopic) {
    return (
      <>
        <StatusBar style="dark" />
        <ResultsScreen
          topic={activeTopic}
          results={lastResults}
          xpGained={lastXp}
          streak={progress.streak}
          onRetry={() => setView('game')}
          onHome={() => { setView('tabs'); setTab('home'); }}
        />
      </>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <View style={styles.flex}>
        <View style={styles.flex}>
          {tab === 'home' && (
            <HomeMapScreen
              onSelectTopic={(topic) => {
                setActiveTopic(topic);
                setSkipReview(false);
                setView('game');
              }}
              streak={progress.streak}
              xp={progress.xp}
            />
          )}
          {tab === 'activity'     && <ActivityScreen />}
          {tab === 'leaderboard'  && <LeaderboardScreen />}
          {tab === 'profile'      && <ProfileScreen />}
        </View>
        <BottomNav active={tab} onPress={setTab} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8F9FF' },
  flex: { flex: 1 },
});
