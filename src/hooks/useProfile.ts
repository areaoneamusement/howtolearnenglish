import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type UserType = 'student' | 'banking' | 'business' | 'tourism';

export type UserProfile = {
  userType: UserType;
  displayName: string;
};

const PROFILE_KEY = '@htlenglish_profile';

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(PROFILE_KEY).then(raw => {
      if (raw) {
        try { setProfile(JSON.parse(raw)); } catch {}
      }
      setLoaded(true);
    });
  }, []);

  const saveProfile = useCallback(async (p: UserProfile) => {
    setProfile(p);
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(p));
  }, []);

  const clearProfile = useCallback(async () => {
    setProfile(null);
    await AsyncStorage.removeItem(PROFILE_KEY);
  }, []);

  return { profile, loaded, saveProfile, clearProfile };
}
