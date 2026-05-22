import { View, Text, StyleSheet } from 'react-native';

type Props = { size?: number };

export default function OanMascot({ size = 80 }: Props) {
  const w = size * 0.72;

  return (
    <View style={{ width: w, height: size, alignItems: 'center' }}>

      {/* Visor tím */}
      <View style={[styles.visor, {
        width: w * 0.88, paddingVertical: size * 0.04,
        borderRadius: size * 0.07,
        borderBottomLeftRadius: 0, borderBottomRightRadius: 0,
      }]}>
        <Text style={[styles.visorText, { fontSize: size * 0.13 }]}>OĂN</Text>
      </View>

      {/* Thân trên - đầu + mặt */}
      <View style={[styles.upperBody, {
        width: w * 0.88, height: size * 0.38,
        borderRadius: size * 0.12,
        borderTopLeftRadius: 0, borderTopRightRadius: 0,
      }]}>
        {/* Má hồng */}
        <View style={styles.cheeksRow}>
          <View style={[styles.cheek, { width: size * 0.1, height: size * 0.06 }]} />
          <View style={{ width: size * 0.12 }} />
          <View style={[styles.cheek, { width: size * 0.1, height: size * 0.06 }]} />
        </View>

        {/* Mắt */}
        <View style={styles.eyesRow}>
          <View style={[styles.eye, { width: size * 0.08, height: size * 0.09, borderRadius: size * 0.045 }]} />
          <View style={{ width: size * 0.08 }} />
          <View style={[styles.eye, { width: size * 0.08, height: size * 0.09, borderRadius: size * 0.045 }]} />
        </View>

        {/* Miệng cười */}
        <View style={[styles.smile, {
          width: size * 0.22, height: size * 0.11,
          borderRadius: size * 0.11,
          borderBottomWidth: size * 0.032,
          marginTop: size * 0.02,
        }]} />
      </View>

      {/* Thân dưới - sọc xanh */}
      <View style={[styles.lowerBody, {
        width: w * 0.88, height: size * 0.3,
        borderRadius: size * 0.1,
        borderTopLeftRadius: 0, borderTopRightRadius: 0,
      }]}>
        <View style={[styles.stripe, { height: size * 0.045, marginBottom: size * 0.03 }]} />
        <View style={[styles.stripe, { height: size * 0.045 }]} />
      </View>

      {/* Đế (chân số 1) */}
      <View style={[styles.base, {
        width: w, height: size * 0.13,
        borderRadius: size * 0.07,
        marginTop: size * 0.025,
      }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  visor: {
    backgroundColor: '#7B2FBE',
    alignItems: 'center', justifyContent: 'center',
    zIndex: 2,
  },
  visorText: {
    color: '#fff', fontWeight: '900', letterSpacing: 1.5,
  },
  upperBody: {
    backgroundColor: '#EFEFEF',
    borderWidth: 2, borderColor: '#D8D8D8',
    borderTopWidth: 0,
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: 6,
    overflow: 'hidden',
  },
  cheeksRow: {
    flexDirection: 'row', alignItems: 'center',
    position: 'absolute', bottom: '28%',
  },
  cheek: {
    backgroundColor: '#FFB3B3', borderRadius: 20, opacity: 0.7,
  },
  eyesRow: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 4,
  },
  eye: {
    backgroundColor: '#222',
  },
  smile: {
    borderColor: '#333',
    borderTopWidth: 0, borderLeftWidth: 0, borderRightWidth: 0,
    backgroundColor: 'transparent',
  },
  lowerBody: {
    backgroundColor: '#E8E8E8',
    borderWidth: 2, borderColor: '#D8D8D8',
    borderTopWidth: 0,
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  stripe: {
    width: '100%',
    backgroundColor: '#4A90D9',
  },
  base: {
    backgroundColor: '#E0E0E0',
    borderWidth: 2, borderColor: '#D0D0D0',
  },
});
