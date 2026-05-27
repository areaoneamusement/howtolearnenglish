import { db } from './firebase';
import {
  doc, setDoc, collection,
  query, orderBy, limit, getDocs,
  serverTimestamp,
} from 'firebase/firestore';

export type LeaderboardEntry = {
  id: string;
  name: string;
  xp: number;
  streak: number;
  userType: string;
};

export async function syncUserScore(
  uid: string,
  name: string,
  xp: number,
  streak: number,
  userType: string,
) {
  const friendCode = uid.substring(0, 6).toUpperCase();
  const ref = doc(db, 'leaderboard', uid);
  await setDoc(ref, { name, xp, streak, userType, friendCode, updatedAt: serverTimestamp() }, { merge: true });
}

export async function getTopPlayers(n = 20): Promise<LeaderboardEntry[]> {
  const q = query(collection(db, 'leaderboard'), orderBy('xp', 'desc'), limit(n));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<LeaderboardEntry, 'id'>) }));
}
