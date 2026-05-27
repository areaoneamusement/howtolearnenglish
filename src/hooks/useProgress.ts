import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type WordStatus = 'new' | 'learning' | 'known';

export type WordProgress = {
  status: WordStatus;
  correctCount: number;
  incorrectCount: number;
};

export type UserProgress = {
  streak: number;
  lastStudyDate: string;
  xp: number;
  wordProgress: Record<string, WordProgress>;
};

const STORAGE_KEY = '@htlenglish_progress';

const defaultProgress: UserProgress = {
  streak: 0,
  lastStudyDate: '',
  xp: 0,
  wordProgress: {},
};

function todayString(): string {
  return new Date().toISOString().split('T')[0];
}

function yesterdayString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

export function wordKey(topicId: string, wordIndex: number): string {
  return `${topicId}_${wordIndex}`;
}

export function useProgress() {
  const [progress, setProgress] = useState<UserProgress>(defaultProgress);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(raw => {
      if (raw) {
        try {
          setProgress(JSON.parse(raw));
        } catch {
          setProgress(defaultProgress);
        }
      }
      setLoaded(true);
    });
  }, []);

  const save = useCallback(async (updated: UserProgress) => {
    setProgress(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, []);

  const recordStudySession = useCallback(async (
    topicId: string,
    results: Array<{ wordIndex: number; correct: boolean }>
  ) => {
    const today = todayString();
    const yesterday = yesterdayString();

    const updated: UserProgress = {
      ...progress,
      wordProgress: { ...progress.wordProgress },
    };

    let xpGained = 0;
    for (const { wordIndex, correct } of results) {
      const key = wordKey(topicId, wordIndex);
      const current = updated.wordProgress[key] ?? {
        status: 'new' as WordStatus,
        correctCount: 0,
        incorrectCount: 0,
      };

      if (correct) {
        xpGained += current.status === 'new' ? 10 : 5;
        const newCorrectCount = current.correctCount + 1;
        updated.wordProgress[key] = {
          status: newCorrectCount >= 3 ? 'known' : 'learning',
          correctCount: newCorrectCount,
          incorrectCount: current.incorrectCount,
        };
      } else {
        updated.wordProgress[key] = {
          status: 'learning',
          correctCount: Math.max(0, current.correctCount - 1),
          incorrectCount: current.incorrectCount + 1,
        };
      }
    }

    updated.xp = progress.xp + xpGained;

    if (today !== progress.lastStudyDate) {
      updated.lastStudyDate = today;
      updated.streak = progress.lastStudyDate === yesterday
        ? progress.streak + 1
        : 1;
    }

    await save(updated);
    return xpGained;
  }, [progress, save]);

  const getTopicStats = useCallback((topicId: string, totalWords: number) => {
    let known = 0;
    let learning = 0;
    for (let i = 0; i < totalWords; i++) {
      const key = wordKey(topicId, i);
      const wp = progress.wordProgress[key];
      if (wp?.status === 'known') known++;
      else if (wp?.status === 'learning') learning++;
    }
    return { known, learning, newCount: totalWords - known - learning };
  }, [progress]);

  const getWordStatus = useCallback((topicId: string, wordIndex: number): WordStatus => {
    return progress.wordProgress[wordKey(topicId, wordIndex)]?.status ?? 'new';
  }, [progress]);

  return { progress, loaded, recordStudySession, getTopicStats, getWordStatus };
}
