import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useFonts } from 'expo-font';
import { signInAnonymously } from 'firebase/auth';

import { Topic, topics, studentTopics, bankingTopics, businessTopics, tourismTopics } from './src/data/vocabulary';
import { useProgress } from './src/hooks/useProgress';
import { useProfile, UserType } from './src/hooks/useProfile';
import { auth } from './src/services/firebase';
import { syncUserScore } from './src/services/leaderboard';
import BottomNav, { TabName } from './src/components/BottomNav';
import OnboardingScreen from './src/screens/OnboardingScreen';

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
  const { profile, loaded: profileLoaded, saveProfile } = useProfile();
  const [tab, setTab] = useState<TabName>('home');
  const [view, setView] = useState<AppView>('tabs');
  const [activeTopic, setActiveTopic] = useState<Topic | null>(null);
  const [lastResults, setLastResults] = useState<GameResult[]>([]);
  const [lastXp, setLastXp] = useState(0);
  const [skipReview, setSkipReview] = useState(false);
  const [firebaseUid, setFirebaseUid] = useState<string | null>(null);

  const [fontsLoaded] = useFonts({
    Nikoovers: require('./assets/fonts/Nikoovers.ttf'),
    MontserratLight: require('./assets/fonts/MontserratLight.otf'),
    BlancInline: require('./assets/fonts/BlancInline.ttf'),
  });

  // Đăng nhập Firebase ẩn danh — mỗi thiết bị có 1 UID duy nhất
  useEffect(() => {
    signInAnonymously(auth)
      .then(cred => setFirebaseUid(cred.user.uid))
      .catch(() => {}); // tiếp tục dùng app dù offline
  }, []);

  const profileTopics = (() => {
    if (!profile) return topics;
    const extra = profile.userType === 'student' ? studentTopics
      : profile.userType === 'banking'  ? bankingTopics
      : profile.userType === 'business' ? businessTopics
      : profile.userType === 'tourism'  ? tourismTopics
      : [];
    return [...topics, ...extra];
  })();

  if (!loaded || !fontsLoaded || !profileLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#A527FF" />
      </View>
    );
  }

  if (!profile) {
    return (
      <>
        <StatusBar style="dark" />
        <OnboardingScreen
          onDone={(userType: UserType, displayName: string) =>
            saveProfile({ userType, displayName })
          }
        />
      </>
    );
  }

  const topicIndex = activeTopic ? profileTopics.findIndex(t => t.id === activeTopic.id) : 0;

  async function handleFinishGame(results: GameResult[]) {
    if (!activeTopic) return;
    const xpGained = await recordStudySession(activeTopic.id, results);
    const newXp = progress.xp + xpGained;

    // Sync điểm lên Firebase (không block nếu offline)
    if (firebaseUid && profile) {
      syncUserScore(
        firebaseUid,
        profile.displayName || 'Người học',
        newXp,
        progress.streak,
        profile.userType,
      ).catch(() => {});
    }

    setLastResults(results);
    setLastXp(xpGained);
    setSkipReview(false);
    setView('results');
  }

  function handleFailReview() {
    if (!activeTopic) return;
    const idx = profileTopics.findIndex(t => t.id === activeTopic.id);
    if (idx > 0) {
      setActiveTopic(profileTopics[idx - 1]);
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
          allTopics={profileTopics}
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
              topics={profileTopics}
              onSelectTopic={(topic) => {
                setActiveTopic(topic);
                setSkipReview(false);
                setView('game');
              }}
              streak={progress.streak}
              xp={progress.xp}
            />
          )}
          {tab === 'activity'    && <ActivityScreen />}
          {tab === 'leaderboard' && <LeaderboardScreen currentUid={firebaseUid} />}
          {tab === 'profile'     && <ProfileScreen firebaseUid={firebaseUid} />}
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
