import { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, Alert, TextInput, Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useProgress } from '../hooks/useProgress';
import { useProfile, UserType } from '../hooks/useProfile';
import { totalWordCount } from '../data/vocabulary';
import OanMascot from '../components/OanMascot';
import { syncUserScore } from '../services/leaderboard';
import { auth } from '../services/firebase';

const USER_TYPE_LABELS: Record<UserType, { icon: string; label: string }> = {
  student:  { icon: '🎓', label: 'Học sinh / Sinh viên' },
  banking:  { icon: '🏦', label: 'Ngân hàng / Tài chính' },
  business: { icon: '💼', label: 'Doanh nghiệp / Văn phòng' },
  tourism:  { icon: '✈️', label: 'Du lịch / Dịch vụ' },
};

const ALL_TYPES: UserType[] = ['student', 'banking', 'business', 'tourism'];

type Props = {
  firebaseUid: string | null;
};

export default function ProfileScreen({ firebaseUid }: Props) {
  const { progress } = useProgress();
  const { profile, saveProfile, clearProfile } = useProfile();
  const level = Math.floor(progress.xp / 100) + 1;
  const totalKnown = Object.values(progress.wordProgress).filter(w => w.status === 'known').length;

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(profile?.displayName ?? '');
  const [editingType, setEditingType] = useState(false);

  async function handleSaveName() {
    if (!profile || !nameInput.trim()) return;
    const updated = { ...profile, displayName: nameInput.trim() };
    await saveProfile(updated);
    if (firebaseUid) {
      syncUserScore(firebaseUid, updated.displayName, progress.xp, progress.streak, profile.userType).catch(() => {});
    }
    setEditingName(false);
  }

  async function handleChangeType(newType: UserType) {
    if (!profile) return;
    const updated = { ...profile, userType: newType };
    await saveProfile(updated);
    if (firebaseUid) {
      syncUserScore(firebaseUid, profile.displayName, progress.xp, progress.streak, newType).catch(() => {});
    }
    setEditingType(false);
    Alert.alert('Đã đổi ngành', 'Bản đồ sẽ cập nhật chủ đề phù hợp khi bạn quay lại.');
  }

  function handleReset() {
    Alert.alert(
      'Xóa toàn bộ tiến độ?',
      'XP, streak và từ đã học sẽ mất. Hồ sơ tên và ngành vẫn giữ.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa tiến độ',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('@htlenglish_progress');
            Alert.alert('Đã xóa', 'Khởi động lại app để thấy thay đổi.');
          },
        },
      ]
    );
  }

  function handleResetAll() {
    Alert.alert(
      'Xóa tất cả & bắt đầu lại?',
      'Toàn bộ tiến độ, hồ sơ và tên sẽ bị xóa. Bạn sẽ thấy màn hình chào lại từ đầu.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa tất cả',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('@htlenglish_progress');
            await clearProfile();
          },
        },
      ]
    );
  }

  const typeInfo = profile ? USER_TYPE_LABELS[profile.userType] : null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>👤 Hồ sơ của tôi</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Mascot + identity */}
        <View style={styles.profileBox}>
          <OanMascot size={90} />
          <Text style={styles.displayName}>{profile?.displayName ?? 'Người học'}</Text>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>⭐ Cấp độ {level}</Text>
          </View>
        </View>

        {/* Quản lý hồ sơ */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Thông tin hồ sơ</Text>

          {/* Tên */}
          <TouchableOpacity style={styles.infoRow} onPress={() => { setNameInput(profile?.displayName ?? ''); setEditingName(true); }}>
            <View style={styles.infoLeft}>
              <Text style={styles.infoIcon}>✏️</Text>
              <View>
                <Text style={styles.infoLabel}>Tên hiển thị</Text>
                <Text style={styles.infoValue}>{profile?.displayName ?? '—'}</Text>
              </View>
            </View>
            <Text style={styles.infoArrow}>›</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Ngành */}
          <TouchableOpacity style={styles.infoRow} onPress={() => setEditingType(true)}>
            <View style={styles.infoLeft}>
              <Text style={styles.infoIcon}>{typeInfo?.icon ?? '📚'}</Text>
              <View>
                <Text style={styles.infoLabel}>Ngành nghề</Text>
                <Text style={styles.infoValue}>{typeInfo?.label ?? '—'}</Text>
              </View>
            </View>
            <Text style={styles.infoArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Stats grid */}
        <View style={styles.statsGrid}>
          {[
            { label: '🔥 Streak', value: `${progress.streak} ngày` },
            { label: '⭐ Tổng XP', value: `${progress.xp} XP` },
            { label: '✅ Đã thuộc', value: `${totalKnown} từ` },
            { label: '📚 Tổng từ', value: `${totalWordCount} từ` },
          ].map((s, i) => (
            <View key={i} style={styles.statBox}>
              <Text style={styles.statVal}>{s.value}</Text>
              <Text style={styles.statLbl}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* About */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Về Area ONE</Text>
          <Text style={styles.cardText}>
            App học tiếng Anh dành riêng cho người Việt mất gốc.{'\n'}
            Mục tiêu: tự tin giao tiếp từng bước một.
          </Text>
          <Text style={styles.versionText}>Phiên bản MVP 2.0 · 🤝 Linh & Claude</Text>
        </View>

        {/* Reset buttons */}
        <TouchableOpacity style={styles.resetBtn} onPress={handleReset} activeOpacity={0.8}>
          <Text style={styles.resetText}>🗑️ Xóa tiến độ học tập</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.resetAllBtn} onPress={handleResetAll} activeOpacity={0.8}>
          <Text style={styles.resetAllText}>⚠️ Xóa tất cả & bắt đầu lại</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal đổi tên */}
      <Modal visible={editingName} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Đổi tên hiển thị</Text>
            <TextInput
              style={styles.modalInput}
              value={nameInput}
              onChangeText={setNameInput}
              placeholder="Nhập tên của bạn..."
              placeholderTextColor="#BBB"
              maxLength={20}
              autoFocus
            />
            <Text style={styles.modalHint}>Tên này hiện trên bảng xếp hạng</Text>
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setEditingName(false)}>
                <Text style={styles.modalCancelText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSave, !nameInput.trim() && styles.modalSaveDisabled]}
                onPress={handleSaveName}
              >
                <Text style={styles.modalSaveText}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal đổi ngành */}
      <Modal visible={editingType} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Đổi ngành nghề</Text>
            {ALL_TYPES.map(type => {
              const info = USER_TYPE_LABELS[type];
              const isActive = profile?.userType === type;
              return (
                <TouchableOpacity
                  key={type}
                  style={[styles.typeOption, isActive && styles.typeOptionActive]}
                  onPress={() => handleChangeType(type)}
                >
                  <Text style={styles.typeOptionIcon}>{info.icon}</Text>
                  <Text style={[styles.typeOptionLabel, isActive && styles.typeOptionLabelActive]}>
                    {info.label}
                  </Text>
                  {isActive && <Text style={styles.typeCheck}>✓</Text>}
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity style={styles.modalCancel} onPress={() => setEditingType(false)}>
              <Text style={styles.modalCancelText}>Hủy</Text>
            </TouchableOpacity>
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
  },
  headerTitle: { fontSize: 18, fontFamily: 'Nikoovers', color: '#1274C6' },
  content: { padding: 16, gap: 14, paddingBottom: 30 },

  profileBox: {
    backgroundColor: '#1274C6', borderRadius: 20, padding: 24,
    alignItems: 'center', gap: 8,
  },
  displayName: { fontSize: 24, fontFamily: 'Nikoovers', color: '#fff', letterSpacing: 1 },
  levelBadge: {
    backgroundColor: '#ffffff30', borderRadius: 16,
    paddingHorizontal: 16, paddingVertical: 6,
  },
  levelText: { fontSize: 14, color: '#fff', fontWeight: '700' },

  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 18, gap: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#1274C6', marginBottom: 8 },
  cardText: { fontSize: 14, color: '#666', lineHeight: 22 },
  versionText: { fontSize: 12, color: '#AAA', marginTop: 6 },

  infoRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingVertical: 10,
  },
  infoLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  infoIcon: { fontSize: 22, width: 30, textAlign: 'center' },
  infoLabel: { fontSize: 12, color: '#AAA' },
  infoValue: { fontSize: 15, fontWeight: '700', color: '#222', marginTop: 2 },
  infoArrow: { fontSize: 20, color: '#CCC' },
  divider: { height: 1, backgroundColor: '#F0F0F0' },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statBox: {
    flex: 1, minWidth: '45%', backgroundColor: '#fff', borderRadius: 14,
    padding: 16, alignItems: 'center', gap: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  statVal: { fontSize: 20, fontWeight: '800', color: '#1274C6' },
  statLbl: { fontSize: 12, color: '#888' },

  resetBtn: {
    backgroundColor: '#FFF0F0', borderRadius: 14, padding: 16,
    alignItems: 'center', borderWidth: 1, borderColor: '#FFCDD2',
  },
  resetText: { fontSize: 15, color: '#FF6B6B', fontWeight: '600' },
  resetAllBtn: {
    backgroundColor: '#FFF5F5', borderRadius: 14, padding: 14,
    alignItems: 'center', borderWidth: 1, borderColor: '#FFBABA',
  },
  resetAllText: { fontSize: 13, color: '#FF4444', fontWeight: '600' },

  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: '#00000066',
    alignItems: 'center', justifyContent: 'center',
  },
  modalBox: {
    backgroundColor: '#fff', borderRadius: 20, padding: 24,
    width: '85%', gap: 12,
  },
  modalTitle: { fontSize: 17, fontWeight: '800', color: '#1274C6', textAlign: 'center' },
  modalInput: {
    borderBottomWidth: 2, borderBottomColor: '#A527FF',
    fontSize: 18, fontWeight: '600', paddingVertical: 8, color: '#222',
  },
  modalHint: { fontSize: 12, color: '#AAA' },
  modalBtns: { flexDirection: 'row', gap: 10, marginTop: 4 },
  modalCancel: {
    flex: 1, padding: 14, borderRadius: 12,
    backgroundColor: '#F5F5F5', alignItems: 'center',
  },
  modalCancelText: { fontSize: 15, color: '#888', fontWeight: '600' },
  modalSave: {
    flex: 1, padding: 14, borderRadius: 12,
    backgroundColor: '#A527FF', alignItems: 'center',
  },
  modalSaveDisabled: { backgroundColor: '#DDD' },
  modalSaveText: { fontSize: 15, color: '#fff', fontWeight: '700' },

  typeOption: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 14, borderRadius: 12, borderWidth: 1.5, borderColor: '#EEE',
  },
  typeOptionActive: { borderColor: '#A527FF', backgroundColor: '#FDF5FF' },
  typeOptionIcon: { fontSize: 22 },
  typeOptionLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: '#444' },
  typeOptionLabelActive: { color: '#A527FF' },
  typeCheck: { fontSize: 18, color: '#A527FF', fontWeight: '800' },
});
