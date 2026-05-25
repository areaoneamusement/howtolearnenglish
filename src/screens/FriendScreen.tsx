import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator,
  Clipboard,
} from 'react-native';
import {
  listenFriendships, sendFriendRequest, acceptFriendRequest,
  rejectFriendRequest, sendChallenge, answerChallenge,
  findUserByCode, getFriendCode, isStreakAlive, ensureFriendCode,
  Friendship,
} from '../services/friends';
import { allTopics } from '../data/vocabulary';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebase';

type Props = { firebaseUid: string };

// Pick a random word not in usedWords (last 30)
function pickWord(usedWords: string[]) {
  const pool = allTopics
    .flatMap(t => t.words)
    .filter(w => !usedWords.includes(w.english));
  if (pool.length === 0) return allTopics[0].words[0]; // fallback
  return pool[Math.floor(Math.random() * pool.length)];
}

// Build 4 MCQ options (1 correct + 3 wrong)
function buildOptions(correctVi: string): string[] {
  const pool = allTopics.flatMap(t => t.words).map(w => w.vietnamese);
  const wrong = pool.filter(v => v !== correctVi).sort(() => Math.random() - 0.5).slice(0, 3);
  return [correctVi, ...wrong].sort(() => Math.random() - 0.5);
}

const USER_TYPE_ICON: Record<string, string> = {
  student: '🎓', banking: '🏦', business: '💼', tourism: '✈️',
};

export default function FriendScreen({ firebaseUid }: Props) {
  const [friendships, setFriendships] = useState<Friendship[]>([]);
  const [friendNames, setFriendNames] = useState<Record<string, string>>({});
  const [friendTypes, setFriendTypes] = useState<Record<string, string>>({});
  const [addModal, setAddModal] = useState(false);
  const [codeInput, setCodeInput] = useState('');
  const [searching, setSearching] = useState(false);
  const [found, setFound] = useState<{ uid: string; name: string; userType: string } | null>(null);
  const [challengeModal, setChallengeModal] = useState<Friendship | null>(null);
  const [challengeWord, setChallengeWord] = useState<ReturnType<typeof pickWord> | null>(null);
  const [answerModal, setAnswerModal] = useState<Friendship | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);

  const myCode = getFriendCode(firebaseUid);

  // Ensure friendCode is stored in Firestore
  useEffect(() => {
    ensureFriendCode(firebaseUid).catch(() => {});
  }, [firebaseUid]);

  // Listen to friendships
  useEffect(() => {
    const unsub = listenFriendships(firebaseUid, setFriendships);
    return unsub;
  }, [firebaseUid]);

  // Load friend names/types
  useEffect(() => {
    const uids = [...new Set(
      friendships.flatMap(f => f.uids).filter(u => u !== firebaseUid)
    )];
    uids.forEach(async uid => {
      try {
        const snap = await getDoc(doc(db, 'leaderboard', uid));
        if (snap.exists()) {
          setFriendNames(prev => ({ ...prev, [uid]: snap.data().name ?? 'Người học' }));
          setFriendTypes(prev => ({ ...prev, [uid]: snap.data().userType ?? 'student' }));
        }
      } catch {}
    });
  }, [friendships]);

  const getFriendUid = (f: Friendship) => f.uids.find(u => u !== firebaseUid) ?? '';

  // ─── Add friend ────────────────────────────────────────────────────────────

  async function handleSearch() {
    if (codeInput.trim().length < 6) return;
    if (codeInput.trim().toUpperCase() === myCode) {
      Alert.alert('Ơ kìa', 'Đó là mã của chính bạn 😄');
      return;
    }
    setSearching(true);
    setFound(null);
    try {
      const result = await findUserByCode(codeInput.trim());
      if (!result) Alert.alert('Không tìm thấy', 'Mã không đúng hoặc chưa ai dùng.');
      else setFound(result);
    } catch {
      Alert.alert('Lỗi', 'Không thể tìm kiếm lúc này.');
    } finally {
      setSearching(false);
    }
  }

  async function handleSendRequest() {
    if (!found) return;
    try {
      await sendFriendRequest(firebaseUid, found.uid);
      Alert.alert('Đã gửi!', `Lời mời đã gửi đến ${found.name}.`);
      setAddModal(false);
      setCodeInput('');
      setFound(null);
    } catch (e: any) {
      Alert.alert('Lỗi', e.message ?? 'Không gửi được lời mời.');
    }
  }

  // ─── Accept / Reject ───────────────────────────────────────────────────────

  async function handleAccept(f: Friendship) {
    const otherUid = getFriendUid(f);
    await acceptFriendRequest(firebaseUid, otherUid).catch(() => {});
  }

  async function handleReject(f: Friendship) {
    const otherUid = getFriendUid(f);
    await rejectFriendRequest(firebaseUid, otherUid).catch(() => {});
  }

  // ─── Send challenge ────────────────────────────────────────────────────────

  function openChallenge(f: Friendship) {
    setChallengeWord(pickWord(f.usedWords ?? []));
    setChallengeModal(f);
  }

  function rerollWord() {
    if (!challengeModal) return;
    setChallengeWord(pickWord(challengeModal.usedWords ?? []));
  }

  async function handleSendChallenge(f: Friendship) {
    if (!challengeWord) return;
    const options = buildOptions(challengeWord.vietnamese);
    await sendChallenge(f.id, firebaseUid, getFriendUid(f), challengeWord, options);
    setChallengeModal(null);
    setChallengeWord(null);
    Alert.alert('Đã gửi! 🎯', `Câu hỏi về "${challengeWord.english}" đã đến bạn của bạn.`);
  }

  // ─── Answer challenge ──────────────────────────────────────────────────────

  function openAnswer(f: Friendship) {
    setAnswerModal(f);
    setSelected(null);
    setAnswered(false);
  }

  async function handleAnswer(f: Friendship, choice: string) {
    if (answered) return;
    const correct = choice === f.pendingChallenge!.word.vietnamese;
    setSelected(choice);
    setAnswered(true);
    setTimeout(async () => {
      await answerChallenge(
        f.id, firebaseUid, correct,
        f.pendingChallenge!.word.english,
        f.streak, f.usedWords ?? [],
        f.lastStreakDate,
      );
      setAnswerModal(null);
      if (correct) {
        Alert.alert('🔥 Đúng rồi!', `Streak: ${f.streak + 1} ngày liên tiếp!`);
      } else {
        Alert.alert('😅 Sai rồi', 'Streak về 0. Cố lên lần sau nhé!');
      }
    }, 800);
  }

  // ─── Partition friendships ─────────────────────────────────────────────────

  const pending  = friendships.filter(f => f.status === 'pending' && f.requestedBy !== firebaseUid);
  const active   = friendships.filter(f => f.status === 'active');
  const outgoing = friendships.filter(f => f.status === 'pending' && f.requestedBy === firebaseUid);

  // Red dot badge — exported via parent
  const hasBadge = pending.length > 0 || active.some(
    f => f.pendingChallenge?.toUid === firebaseUid
  );

  function renderActiveFriend(f: Friendship) {
    const otherUid = getFriendUid(f);
    const name = friendNames[otherUid] ?? '...';
    const utype = friendTypes[otherUid] ?? 'student';
    const alive = isStreakAlive(f.lastStreakDate);
    const todayDate = new Date().toISOString().split('T')[0];
    const doneToday = f.lastStreakDate === todayDate;
    const myTurnToAsk = f.turnToAsk === firebaseUid && !f.pendingChallenge;
    const incomingChallenge = f.pendingChallenge?.toUid === firebaseUid;
    const waitingForFriendAnswer = f.pendingChallenge?.toUid === otherUid;
    // Bạn chưa hỏi hôm nay và không có câu hỏi nào đang chờ
    const waitingForFriendToAsk = !f.pendingChallenge && !myTurnToAsk && !doneToday;

    return (
      <View key={f.id} style={styles.friendCard}>
        <View style={styles.friendInfo}>
          <Text style={styles.friendIcon}>{USER_TYPE_ICON[utype] ?? '👤'}</Text>
          <View>
            <Text style={styles.friendName}>{name}</Text>
            <Text style={[styles.streakLine, !alive && { color: '#FF6B6B' }]}>
              {alive ? `🔥 ${f.streak} ngày` : `💔 ${f.streak} ngày (sắp mất)`}
            </Text>
          </View>
        </View>

        {incomingChallenge && (
          <TouchableOpacity style={styles.btnAnswer} onPress={() => openAnswer(f)}>
            <Text style={styles.btnAnswerText}>❓ Trả lời</Text>
          </TouchableOpacity>
        )}
        {myTurnToAsk && (
          <TouchableOpacity style={styles.btnAsk} onPress={() => openChallenge(f)}>
            <Text style={styles.btnAskText}>📤 Hỏi bạn</Text>
          </TouchableOpacity>
        )}
        {waitingForFriendAnswer && (
          <View style={styles.btnWait}>
            <Text style={styles.btnWaitText}>⏳ Đang chờ</Text>
          </View>
        )}
        {waitingForFriendToAsk && (
          <View style={styles.btnWait}>
            <Text style={styles.btnWaitText}>⏳ Chờ bạn hỏi</Text>
          </View>
        )}
        {doneToday && !incomingChallenge && !myTurnToAsk && !waitingForFriendAnswer && (
          <View style={styles.btnWait}>
            <Text style={styles.btnWaitText}>✅ Hôm nay xong</Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>👥 Bạn bè</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setAddModal(true)}>
          <Text style={styles.addBtnText}>+ Thêm</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Mã của tôi */}
        <TouchableOpacity
          style={styles.myCodeBox}
          onPress={() => {
            Clipboard.setString(myCode);
            Alert.alert('Đã copy!', `Mã của bạn: ${myCode}`);
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.myCodeLabel}>Mã bạn bè của bạn</Text>
          <Text style={styles.myCode}>{myCode}</Text>
          <Text style={styles.myCodeHint}>Nhấn để copy · Chia sẻ cho bạn bè</Text>
        </TouchableOpacity>

        {/* Lời mời đến */}
        {pending.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📨 Lời mời kết bạn ({pending.length})</Text>
            {pending.map(f => {
              const otherUid = getFriendUid(f);
              const name = friendNames[otherUid] ?? 'Người dùng mới';
              return (
                <View key={f.id} style={styles.requestCard}>
                  <Text style={styles.requestName}>{name} muốn kết bạn</Text>
                  <View style={styles.requestBtns}>
                    <TouchableOpacity style={styles.acceptBtn} onPress={() => handleAccept(f)}>
                      <Text style={styles.acceptBtnText}>✓ Chấp nhận</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.rejectBtn} onPress={() => handleReject(f)}>
                      <Text style={styles.rejectBtnText}>✗</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Bạn bè đang hoạt động */}
        {active.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔥 Chuỗi thách đấu</Text>
            {active.map(renderActiveFriend)}
          </View>
        )}

        {/* Đang chờ chấp nhận */}
        {outgoing.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📤 Đã gửi lời mời</Text>
            {outgoing.map(f => (
              <View key={f.id} style={[styles.friendCard, { opacity: 0.6 }]}>
                <Text style={styles.friendName}>
                  {friendNames[getFriendUid(f)] ?? '...'}
                </Text>
                <Text style={styles.btnWaitText}>Chờ chấp nhận...</Text>
              </View>
            ))}
          </View>
        )}

        {active.length === 0 && pending.length === 0 && outgoing.length === 0 && (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyEmoji}>🤝</Text>
            <Text style={styles.emptyText}>Chưa có bạn bè nào.{'\n'}Chia sẻ mã để bắt đầu thách đấu!</Text>
          </View>
        )}
      </ScrollView>

      {/* ── Modal thêm bạn ── */}
      <Modal visible={addModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Thêm bạn bè</Text>
            <Text style={styles.modalSub}>Nhập mã 6 ký tự của bạn bè</Text>
            <TextInput
              style={styles.codeInput}
              value={codeInput}
              onChangeText={t => { setCodeInput(t.toUpperCase()); setFound(null); }}
              placeholder="VD: AB1C2D"
              placeholderTextColor="#BBB"
              maxLength={6}
              autoCapitalize="characters"
              autoFocus
            />
            {searching && <ActivityIndicator color="#A527FF" />}
            {found && (
              <View style={styles.foundBox}>
                <Text style={styles.foundName}>
                  {USER_TYPE_ICON[found.userType]} {found.name}
                </Text>
                <TouchableOpacity style={styles.sendReqBtn} onPress={handleSendRequest}>
                  <Text style={styles.sendReqText}>Gửi lời mời kết bạn</Text>
                </TouchableOpacity>
              </View>
            )}
            <View style={styles.modalBtns}>
              {!found && (
                <TouchableOpacity
                  style={[styles.searchBtn, codeInput.length < 6 && { opacity: 0.4 }]}
                  onPress={handleSearch}
                  disabled={codeInput.length < 6}
                >
                  <Text style={styles.searchBtnText}>🔍 Tìm kiếm</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.cancelBtn} onPress={() => { setAddModal(false); setCodeInput(''); setFound(null); }}>
                <Text style={styles.cancelBtnText}>Đóng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Modal gửi câu hỏi ── */}
      <Modal visible={!!challengeModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            {challengeModal && challengeWord && (
              <>
                <Text style={styles.modalTitle}>📤 Gửi câu hỏi</Text>
                <Text style={styles.modalSub}>
                  Đến: {friendNames[getFriendUid(challengeModal)] ?? '...'}
                </Text>
                <View style={styles.wordPreview}>
                  <Text style={styles.wordPreviewEn}>{challengeWord.english}</Text>
                  <Text style={styles.wordPreviewVi}>{challengeWord.vietnamese}</Text>
                  <Text style={styles.wordPreviewPron}>/{challengeWord.pronunciation}/</Text>
                </View>
                <TouchableOpacity style={styles.rerollBtn} onPress={rerollWord}>
                  <Text style={styles.rerollBtnText}>🔄 Thử từ khác</Text>
                </TouchableOpacity>
                <Text style={styles.modalHint}>
                  Từ này sẽ được gửi dưới dạng câu hỏi trắc nghiệm
                </Text>
                <View style={styles.modalBtns}>
                  <TouchableOpacity
                    style={styles.sendReqBtn}
                    onPress={() => handleSendChallenge(challengeModal)}
                  >
                    <Text style={styles.sendReqText}>Gửi câu hỏi này 🎯</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => { setChallengeModal(null); setChallengeWord(null); }}>
                    <Text style={styles.cancelBtnText}>Hủy</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* ── Modal trả lời câu hỏi ── */}
      <Modal visible={!!answerModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            {answerModal?.pendingChallenge && (
              <>
                <Text style={styles.modalTitle}>❓ Câu hỏi từ bạn</Text>
                <Text style={styles.modalSub}>
                  {friendNames[answerModal.pendingChallenge.fromUid] ?? '...'} hỏi bạn:
                </Text>
                <View style={styles.wordPreview}>
                  <Text style={styles.wordPreviewEn}>
                    {answerModal.pendingChallenge.word.english}
                  </Text>
                  <Text style={styles.wordPreviewPron}>
                    /{answerModal.pendingChallenge.word.pronunciation}/
                  </Text>
                </View>
                <Text style={styles.modalHint}>Chọn nghĩa đúng:</Text>
                <View style={styles.optionsList}>
                  {answerModal.pendingChallenge.options.map((opt, i) => {
                    const correct = opt === answerModal.pendingChallenge!.word.vietnamese;
                    const isSelected = opt === selected;
                    return (
                      <TouchableOpacity
                        key={i}
                        onPress={() => handleAnswer(answerModal, opt)}
                        style={[
                          styles.option,
                          !answered && styles.optionDefault,
                          answered && correct && styles.optionCorrect,
                          answered && isSelected && !correct && styles.optionWrong,
                          answered && !isSelected && !correct && styles.optionFaded,
                        ]}
                      >
                        <Text style={[
                          styles.optionText,
                          answered && correct && { color: '#00B894' },
                          answered && isSelected && !correct && { color: '#FF6B6B' },
                        ]}>{opt}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                {!answered && (
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => setAnswerModal(null)}>
                    <Text style={styles.cancelBtnText}>Để sau</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FF' },
  header: {
    paddingHorizontal: 20, paddingVertical: 14,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#DDE9F5',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  headerTitle: { fontSize: 18, fontFamily: 'Nikoovers', color: '#1274C6' },
  addBtn: {
    backgroundColor: '#A527FF', borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 6,
  },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  content: { padding: 16, gap: 14, paddingBottom: 40 },

  myCodeBox: {
    backgroundColor: '#1274C6', borderRadius: 20, padding: 20,
    alignItems: 'center', gap: 6,
  },
  myCodeLabel: { fontSize: 12, color: '#B3D4F0', fontWeight: '600' },
  myCode: { fontSize: 40, fontFamily: 'BlancInline', color: '#fff', letterSpacing: 6 },
  myCodeHint: { fontSize: 11, color: '#B3D4F0' },

  section: { gap: 10 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#888' },

  friendCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  friendInfo: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  friendIcon: { fontSize: 28 },
  friendName: { fontSize: 15, fontWeight: '700', color: '#222' },
  streakLine: { fontSize: 13, color: '#FF6B6B', fontWeight: '600', marginTop: 2 },

  btnAnswer: {
    backgroundColor: '#A527FF', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  btnAnswerText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  btnAsk: {
    backgroundColor: '#1274C6', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  btnAskText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  btnWait: {
    backgroundColor: '#F5F5F5', borderRadius: 12,
    paddingHorizontal: 10, paddingVertical: 8,
  },
  btnWaitText: { color: '#AAA', fontWeight: '600', fontSize: 12 },

  requestCard: {
    backgroundColor: '#FFF5FF', borderRadius: 16, padding: 14,
    borderWidth: 1.5, borderColor: '#E8B4FF', gap: 10,
  },
  requestName: { fontSize: 15, fontWeight: '700', color: '#222' },
  requestBtns: { flexDirection: 'row', gap: 10 },
  acceptBtn: {
    flex: 1, backgroundColor: '#A527FF', borderRadius: 12,
    paddingVertical: 10, alignItems: 'center',
  },
  acceptBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  rejectBtn: {
    backgroundColor: '#F5F5F5', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 10, alignItems: 'center',
  },
  rejectBtnText: { color: '#888', fontWeight: '700', fontSize: 14 },

  emptyBox: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  emptyEmoji: { fontSize: 56 },
  emptyText: { fontSize: 15, color: '#888', textAlign: 'center', lineHeight: 24 },

  // Modals
  modalOverlay: {
    flex: 1, backgroundColor: '#00000066',
    alignItems: 'center', justifyContent: 'center',
  },
  modalBox: {
    backgroundColor: '#fff', borderRadius: 24, padding: 24,
    width: '90%', gap: 12, maxHeight: '85%',
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#1274C6', textAlign: 'center' },
  modalSub: { fontSize: 13, color: '#888', textAlign: 'center' },
  modalHint: { fontSize: 12, color: '#AAA', textAlign: 'center' },

  codeInput: {
    borderBottomWidth: 2, borderBottomColor: '#A527FF',
    fontSize: 28, fontWeight: '800', color: '#222',
    textAlign: 'center', paddingVertical: 8, letterSpacing: 6,
  },
  foundBox: {
    backgroundColor: '#F8F4FF', borderRadius: 16, padding: 14,
    alignItems: 'center', gap: 10,
  },
  foundName: { fontSize: 17, fontWeight: '700', color: '#222' },

  modalBtns: { gap: 10, marginTop: 4 },
  searchBtn: {
    backgroundColor: '#1274C6', borderRadius: 14,
    padding: 14, alignItems: 'center',
  },
  searchBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  sendReqBtn: {
    backgroundColor: '#A527FF', borderRadius: 14,
    padding: 14, alignItems: 'center',
  },
  sendReqText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  cancelBtn: {
    backgroundColor: '#F5F5F5', borderRadius: 14,
    padding: 14, alignItems: 'center',
  },
  cancelBtnText: { color: '#888', fontWeight: '600', fontSize: 15 },

  rerollBtn: {
    alignSelf: 'center',
    paddingHorizontal: 18, paddingVertical: 8,
    backgroundColor: '#F0F4FF', borderRadius: 20, borderWidth: 1, borderColor: '#DDE9F5',
  },
  rerollBtnText: { fontSize: 14, color: '#1274C6', fontWeight: '600' },

  wordPreview: {
    backgroundColor: '#EDF5FF', borderRadius: 16,
    padding: 16, alignItems: 'center', gap: 4,
  },
  wordPreviewEn: { fontSize: 32, fontFamily: 'BlancInline', color: '#1274C6' },
  wordPreviewVi: { fontSize: 18, fontWeight: '700', color: '#00B894' },
  wordPreviewPron: { fontSize: 13, color: '#88B', fontStyle: 'italic' },

  optionsList: { gap: 10 },
  option: {
    padding: 16, borderRadius: 14, borderWidth: 2, alignItems: 'center',
  },
  optionDefault: { backgroundColor: '#fff', borderColor: '#E8EAFF' },
  optionCorrect: { backgroundColor: '#E8FFF8', borderColor: '#00C896' },
  optionWrong: { backgroundColor: '#FFF0F0', borderColor: '#FF6B6B' },
  optionFaded: { backgroundColor: '#fff', borderColor: '#EEE', opacity: 0.5 },
  optionText: { fontSize: 16, fontWeight: '600', color: '#444' },
});
