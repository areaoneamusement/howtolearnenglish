import { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import OanMascot from '../components/OanMascot';
import { UserType } from '../hooks/useProfile';

type Props = {
  onDone: (userType: UserType, displayName: string) => void;
};

type Step = 'who' | 'job' | 'name';

const JOB_OPTIONS: { type: UserType; icon: string; label: string; sub: string }[] = [
  { type: 'banking',  icon: '🏦', label: 'Ngân hàng / Tài chính', sub: 'Giao dịch, tín dụng, đầu tư' },
  { type: 'business', icon: '💼', label: 'Doanh nghiệp / Văn phòng', sub: 'Họp, email, quản lý' },
  { type: 'tourism',  icon: '✈️', label: 'Du lịch / Dịch vụ', sub: 'Khách sạn, nhà hàng, hướng dẫn' },
];

const STEP_LABELS = ['Nhóm', 'Ngành', 'Tên'];

export default function OnboardingScreen({ onDone }: Props) {
  const [step, setStep] = useState<Step>('who');
  const [selectedType, setSelectedType] = useState<UserType | null>(null);
  const [name, setName] = useState('');

  const stepIndex = step === 'who' ? 0 : step === 'job' ? 1 : 2;

  function handleSelectWorker(type: UserType) {
    setSelectedType(type);
    setStep('name');
  }

  function handleSelectStudent() {
    setSelectedType('student');
    setStep('name');
  }

  function handleDone() {
    if (!selectedType) return;
    const finalName = name.trim() || 'Người học';
    onDone(selectedType, finalName);
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Mascot + bubble */}
        <View style={styles.mascotRow}>
          <OanMascot size={90} />
          <View style={styles.bubble}>
            <Text style={styles.bubbleText}>
              {step === 'who'  && 'Chào bạn! Mình là OĂN 👋\nBạn thuộc nhóm nào?'}
              {step === 'job'  && 'Bạn đang làm ở ngành nào?'}
              {step === 'name' && 'Đặt tên hiển thị trên bảng xếp hạng nhé!'}
            </Text>
          </View>
        </View>

        {/* Step dots */}
        <View style={styles.stepRow}>
          {STEP_LABELS.map((_, i) => (
            <View key={i} style={[styles.stepDot, i <= stepIndex && styles.stepDotActive]} />
          ))}
        </View>

        {/* Step 1 — Who */}
        {step === 'who' && (
          <View style={styles.options}>
            <TouchableOpacity style={styles.optionCard} activeOpacity={0.85} onPress={() => setStep('job')}>
              <Text style={styles.optionIcon}>👔</Text>
              <View style={styles.optionText}>
                <Text style={styles.optionLabel}>Đi làm</Text>
                <Text style={styles.optionSub}>Học tiếng Anh chuyên ngành</Text>
              </View>
              <Text style={styles.optionArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionCard} activeOpacity={0.85} onPress={handleSelectStudent}>
              <Text style={styles.optionIcon}>🎓</Text>
              <View style={styles.optionText}>
                <Text style={styles.optionLabel}>Học sinh / Sinh viên</Text>
                <Text style={styles.optionSub}>Cải thiện tiếng Anh học thuật</Text>
              </View>
              <Text style={styles.optionArrow}>›</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Step 2 — Job */}
        {step === 'job' && (
          <View style={styles.options}>
            {JOB_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.type} style={styles.optionCard} activeOpacity={0.85}
                onPress={() => handleSelectWorker(opt.type)}
              >
                <Text style={styles.optionIcon}>{opt.icon}</Text>
                <View style={styles.optionText}>
                  <Text style={styles.optionLabel}>{opt.label}</Text>
                  <Text style={styles.optionSub}>{opt.sub}</Text>
                </View>
                <Text style={styles.optionArrow}>›</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => setStep('who')} style={styles.backBtn}>
              <Text style={styles.backBtnText}>‹ Quay lại</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Step 3 — Name */}
        {step === 'name' && (
          <View style={styles.options}>
            <View style={styles.nameCard}>
              <Text style={styles.nameLabel}>Tên của bạn</Text>
              <TextInput
                style={styles.nameInput}
                placeholder="VD: Linh, Minh, OĂN Fan..."
                placeholderTextColor="#BBB"
                value={name}
                onChangeText={setName}
                maxLength={20}
                autoFocus
              />
              <Text style={styles.nameHint}>Tên này hiện trên bảng xếp hạng · tối đa 20 ký tự</Text>
            </View>

            <TouchableOpacity
              style={[styles.doneBtn, !name.trim() && styles.doneBtnDisabled]}
              activeOpacity={0.85}
              onPress={handleDone}
            >
              <Text style={styles.doneBtnText}>Bắt đầu học 🚀</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setStep(selectedType === 'student' ? 'who' : 'job')} style={styles.backBtn}>
              <Text style={styles.backBtnText}>‹ Quay lại</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.note}>Có thể thay đổi sau trong Hồ sơ</Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F6FF' },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 32, gap: 24 },

  mascotRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 16 },
  bubble: {
    flex: 1, backgroundColor: '#fff', borderRadius: 20, borderBottomLeftRadius: 4,
    padding: 16, marginBottom: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  bubbleText: { fontSize: 15, color: '#1274C6', fontWeight: '600', lineHeight: 22 },

  stepRow: { flexDirection: 'row', gap: 8, justifyContent: 'center' },
  stepDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#D0E4F7' },
  stepDotActive: { backgroundColor: '#A527FF', width: 24 },

  options: { gap: 12 },
  optionCard: {
    backgroundColor: '#fff', borderRadius: 18, padding: 18,
    flexDirection: 'row', alignItems: 'center', gap: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
    borderWidth: 1.5, borderColor: '#E8F0FA',
  },
  optionIcon: { fontSize: 32, width: 44, textAlign: 'center' },
  optionText: { flex: 1, gap: 3 },
  optionLabel: { fontSize: 16, fontWeight: '700', color: '#1274C6' },
  optionSub: { fontSize: 12, color: '#888', lineHeight: 17 },
  optionArrow: { fontSize: 22, color: '#A527FF', fontWeight: '700' },

  nameCard: {
    backgroundColor: '#fff', borderRadius: 18, padding: 20, gap: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
  },
  nameLabel: { fontSize: 14, fontWeight: '700', color: '#1274C6' },
  nameInput: {
    fontSize: 18, fontWeight: '600', color: '#222',
    borderBottomWidth: 2, borderBottomColor: '#A527FF',
    paddingVertical: 8,
  },
  nameHint: { fontSize: 11, color: '#AAA' },

  doneBtn: {
    backgroundColor: '#A527FF', borderRadius: 18, padding: 18,
    alignItems: 'center',
    shadowColor: '#A527FF', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 8, elevation: 5,
  },
  doneBtnDisabled: { backgroundColor: '#DDD', shadowOpacity: 0 },
  doneBtnText: { fontSize: 17, fontWeight: '800', color: '#fff' },

  backBtn: { alignItems: 'center', paddingVertical: 8 },
  backBtnText: { fontSize: 15, color: '#A527FF', fontWeight: '600' },

  note: { fontSize: 12, color: '#BBB', textAlign: 'center', marginTop: 'auto', paddingBottom: 16 },
});
