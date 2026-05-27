import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: 'AIzaSyDVnx2zkGzW8kW-YVZa5q5oRUtzVOluSuI',
  authDomain: 'area-one.firebaseapp.com',
  projectId: 'area-one',
  storageBucket: 'area-one.firebasestorage.app',
  messagingSenderId: '558016228915',
  appId: '1:558016228915:web:a4aadc7e86c519eb0cbd46',
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);
