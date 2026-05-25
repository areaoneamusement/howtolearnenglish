import {
  doc, setDoc, getDoc, updateDoc, query, collection,
  where, getDocs, onSnapshot, Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';

// ─── Types ────────────────────────────────────────────────────────────────────

export type FriendshipStatus = 'pending' | 'active';

export type PendingChallenge = {
  fromUid: string;
  toUid: string;
  word: { english: string; vietnamese: string; pronunciation: string; level: string };
  options: string[]; // 4 Vietnamese options
  createdAt: any;
  date: string; // YYYY-MM-DD
};

export type Friendship = {
  id: string;
  uids: string[];
  status: FriendshipStatus;
  requestedBy: string;
  streak: number;
  lastStreakDate: string | null;
  turnToAsk: string; // uid of who sends next challenge
  usedWords: string[]; // last 30 english words used in this friendship
  pendingChallenge: PendingChallenge | null;
  createdAt: any;
  // populated client-side:
  friendName?: string;
  friendUserType?: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getFriendCode(uid: string): string {
  return uid.substring(0, 6).toUpperCase();
}

function makeFriendshipId(uid1: string, uid2: string): string {
  return [uid1, uid2].sort().join('_');
}

function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

/** Returns true if streak is still alive (lastStreakDate was today or yesterday) */
export function isStreakAlive(lastStreakDate: string | null): boolean {
  if (!lastStreakDate) return true; // brand new friendship
  const today = new Date(todayStr());
  const last  = new Date(lastStreakDate);
  const diffDays = Math.floor((today.getTime() - last.getTime()) / 86400000);
  return diffDays <= 1;
}

// ─── Find user by friend code ─────────────────────────────────────────────────

export async function findUserByCode(
  code: string,
): Promise<{ uid: string; name: string; userType: string } | null> {
  const upper = code.toUpperCase().trim();
  const q = query(collection(db, 'leaderboard'), where('friendCode', '==', upper));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { uid: d.id, name: d.data().name, userType: d.data().userType };
}

// ─── Friend request ───────────────────────────────────────────────────────────

export async function sendFriendRequest(myUid: string, targetUid: string): Promise<void> {
  const fid = makeFriendshipId(myUid, targetUid);
  const existing = await getDoc(doc(db, 'friendships', fid));
  if (existing.exists()) throw new Error('Đã là bạn bè hoặc đã gửi lời mời');
  await setDoc(doc(db, 'friendships', fid), {
    uids: [myUid, targetUid],
    status: 'pending',
    requestedBy: myUid,
    streak: 0,
    lastStreakDate: null,
    turnToAsk: myUid, // sender asks first
    usedWords: [],
    pendingChallenge: null,
    createdAt: Timestamp.now(),
  });
}

export async function acceptFriendRequest(myUid: string, otherUid: string): Promise<void> {
  const fid = makeFriendshipId(myUid, otherUid);
  await updateDoc(doc(db, 'friendships', fid), { status: 'active' });
}

export async function rejectFriendRequest(myUid: string, otherUid: string): Promise<void> {
  const fid = makeFriendshipId(myUid, otherUid);
  // Just delete by setting to rejected status (or we can deleteDoc)
  await updateDoc(doc(db, 'friendships', fid), { status: 'rejected' });
}

// ─── Listen to all friendships ────────────────────────────────────────────────

export function listenFriendships(
  uid: string,
  callback: (list: Friendship[]) => void,
): () => void {
  const q = query(
    collection(db, 'friendships'),
    where('uids', 'array-contains', uid),
  );
  return onSnapshot(q, snap => {
    const list = snap.docs
      .map(d => ({ id: d.id, ...d.data() } as Friendship))
      .filter(f => f.status !== 'rejected');
    callback(list);
  });
}

// ─── Send a challenge ─────────────────────────────────────────────────────────

export async function sendChallenge(
  fid: string,
  fromUid: string,
  toUid: string,
  word: { english: string; vietnamese: string; pronunciation: string; level: string },
  options: string[], // 4 choices including correct
): Promise<void> {
  await updateDoc(doc(db, 'friendships', fid), {
    pendingChallenge: {
      fromUid,
      toUid,
      word,
      options,
      createdAt: Timestamp.now(),
      date: todayStr(),
    },
  });
}

// ─── Answer a challenge ───────────────────────────────────────────────────────

export async function answerChallenge(
  fid: string,
  answererUid: string,
  correct: boolean,
  wordEnglish: string,
  currentStreak: number,
  currentUsedWords: string[],
  lastStreakDate: string | null,
): Promise<void> {
  const today = todayStr();
  const newUsedWords = [...currentUsedWords, wordEnglish].slice(-30);
  // Chỉ tăng streak 1 lần mỗi ngày — tránh tăng liên tục trong cùng 1 ngày
  const alreadyDoneToday = lastStreakDate === today;
  const newStreak = correct
    ? (alreadyDoneToday ? currentStreak : currentStreak + 1)
    : 0;

  await updateDoc(doc(db, 'friendships', fid), {
    pendingChallenge: null,
    streak: newStreak,
    lastStreakDate: today,
    turnToAsk: answererUid,
    usedWords: newUsedWords,
  });
}

// ─── Ensure friendCode is saved on leaderboard doc ───────────────────────────

export async function ensureFriendCode(uid: string): Promise<void> {
  const ref = doc(db, 'leaderboard', uid);
  const snap = await getDoc(ref);
  if (!snap.exists() || !snap.data()?.friendCode) {
    const code = getFriendCode(uid);
    if (snap.exists()) {
      await updateDoc(ref, { friendCode: code });
    } else {
      await setDoc(ref, { friendCode: code }, { merge: true });
    }
  }
}
