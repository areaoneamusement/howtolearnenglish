import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import OanMascot from '../components/OanMascot';
import { UserType } from '../hooks/useProfile';

const { width: SW } = Dimensions.get('window');

type Props = {
  onDone: (userType: UserType) => void;
};

type Step = 'who' | 'job';

const JOB_OPTIONS: { type: UserType; icon: string; label: string; sub: string }[] = [
  { type: 'banking',  icon: '🏦', label: 'Ngân hàng / Tài chính', sub: 'Giao dịch, tín dụng, đầu tư' },
  { type: 'business', icon: '💼', label: 'Doanh nghiệp / Văn phòng', sub: 'Họp, email, quản lý' },
  { type: 'tourism',  icon: '✈️', label: 'Du lịch / Dịch vụ', sub: 'Khách sạn, nhà hàng, hướng dẫn' },
];

export default function OnboardingScreen({ onDone }: Props) {
  const [step, setStep] = useState<Step>('who');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.mascotRow}>
          <OanMascot size={90} />
          <View style={styles.bubble}>
            <Text style={styles.bubbleText}>
              {step === 'who'
                ? 'Chào bạn! Mình là OĂN 👋\nBạn thuộc nhóm nào?'
                : 'Bạn làm việc ở ngành nào?'}
            </Text>
          </View>
        </View>

        {/* Step indicator */}
        <View style={styles.stepRow}>
          <View style={[styles.stepDot, styles.stepDotActive]} />
          <View style={[styles.stepDot, step === 'job' && styles.stepDotActive]} />
        </View>

        {/* Step 1 — Who are you? */}
        {step === 'who' && (
          <View style={styles.options}>
            <TouchableOpacity
              style={styles.optionCard}
              activeOpacity={0.85}
              onPress={() => setStep('job')}
            >
              <Text style={styles.optionIcon}>👔</Text>
              <View style={styles.optionText}>
                <Text style={styles.optionLabel}>Đi làm</Text>
                <Text style={styles.optionSub}>Tôi đang đi làm và muốn học tiếng Anh chuyên ngành</Text>
              </View>
              <Text style={styles.optionArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionCard}
              activeOpacity={0.85}
              onPress={() => onDone('student')}
            >
              <Text style={styles.optionIcon}>🎓</Text>
              <View style={styles.optionText}>
                <Text style={styles.optionLabel}>Học sinh / Sinh viên</Text>
                <Text style={styles.optionSub}>Tôi đang học và muốn cải thiện tiếng Anh học thuật</Text>
              </View>
              <Text style={styles.optionArrow}>›</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Step 2 — Which industry? */}
        {step === 'job' && (
          <View style={styles.options}>
            {JOB_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.type}
                style={styles.optionCard}
                activeOpacity={0.85}
                onPress={() => onDone(opt.type)}
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

        <Text style={styles.note}>Bạn có thể thay đổi sau trong Hồ sơ</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F6FF' },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 32, gap: 24 },

  mascotRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 16 },
  bubble: {
    flex: 1, backgroundColor: '#fff',
    borderRadius: 20, borderBottomLeftRadius: 4,
    padding: 16, marginBottom: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  bubbleText: { fontSize: 15, color: '#1274C6', fontWeight: '600', lineHeight: 22 },

  stepRow: { flexDirection: 'row', gap: 8, justifyContent: 'center' },
  stepDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#D0E4F7',
  },
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

  backBtn: { alignItems: 'center', paddingVertical: 8 },
  backBtnText: { fontSize: 15, color: '#A527FF', fontWeight: '600' },

  note: { fontSize: 12, color: '#BBB', textAlign: 'center', marginTop: 'auto', paddingBottom: 16 },
});
