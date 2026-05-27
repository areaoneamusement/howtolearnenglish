import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
} from 'react-native';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth } from '../services/firebase';

type Mode = 'login' | 'register';

export default function AuthScreen() {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!email.trim() || password.length < 6) {
      Alert.alert('Thiếu thông tin', 'Nhập email và mật khẩu ít nhất 6 ký tự.');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      } else {
        await createUserWithEmailAndPassword(auth, email.trim(), password);
      }
      // onAuthStateChanged trong App.tsx sẽ tự cập nhật
    } catch (e: any) {
      Alert.alert('Lỗi', getErrorMessage(e.code));
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    if (!email.trim()) {
      Alert.alert('Nhập email trước', 'Điền email vào ô trên rồi nhấn "Quên mật khẩu?"');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email.trim());
      Alert.alert('Đã gửi! 📬', 'Kiểm tra hộp thư để đặt lại mật khẩu.');
    } catch {
      Alert.alert('Lỗi', 'Không gửi được email. Kiểm tra lại địa chỉ.');
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.inner}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Brand */}
        <View style={styles.header}>
          <Text style={styles.brand}>Area ONE</Text>
          <Text style={styles.subtitle}>Học tiếng Anh cùng bạn bè 🇻🇳</Text>
        </View>

        {/* Tab toggle */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, mode === 'login' && styles.tabActive]}
            onPress={() => setMode('login')}
          >
            <Text style={[styles.tabText, mode === 'login' && styles.tabTextActive]}>
              Đăng nhập
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, mode === 'register' && styles.tabActive]}
            onPress={() => setMode('register')}
          >
            <Text style={[styles.tabText, mode === 'register' && styles.tabTextActive]}>
              Tạo tài khoản
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor="#BBB"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Mật khẩu (ít nhất 6 ký tự)"
            placeholderTextColor="#BBB"
            secureTextEntry
            autoCapitalize="none"
          />
        </View>

        {mode === 'login' && (
          <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotBtn}>
            <Text style={styles.forgotText}>Quên mật khẩu?</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.submitBtn, loading && { opacity: 0.6 }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.submitText}>
                {mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}
              </Text>
          }
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function getErrorMessage(code: string): string {
  switch (code) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Email hoặc mật khẩu không đúng.';
    case 'auth/email-already-in-use':
      return 'Email này đã được đăng ký. Hãy chọn "Đăng nhập".';
    case 'auth/weak-password':
      return 'Mật khẩu quá yếu. Dùng ít nhất 6 ký tự.';
    case 'auth/invalid-email':
      return 'Địa chỉ email không hợp lệ.';
    case 'auth/too-many-requests':
      return 'Quá nhiều lần thử. Vui lòng thử lại sau.';
    default:
      return 'Có lỗi xảy ra. Vui lòng thử lại.';
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FF' },
  inner: {
    flex: 1, paddingHorizontal: 28,
    justifyContent: 'center', gap: 20,
  },

  header: { alignItems: 'center', marginBottom: 8 },
  brand: { fontSize: 52, fontFamily: 'Nikoovers', color: '#A527FF' },
  subtitle: { fontSize: 14, color: '#888', marginTop: 6, fontFamily: 'MontserratLight' },

  tabs: {
    flexDirection: 'row', backgroundColor: '#EEF2FF',
    borderRadius: 16, padding: 4,
  },
  tab: {
    flex: 1, paddingVertical: 11, alignItems: 'center', borderRadius: 13,
  },
  tabActive: {
    backgroundColor: '#fff',
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
  },
  tabText: { fontSize: 14, fontWeight: '600', color: '#AAA' },
  tabTextActive: { color: '#1274C6' },

  form: { gap: 12 },
  input: {
    backgroundColor: '#fff', borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 15,
    fontSize: 15, color: '#222',
    borderWidth: 1.5, borderColor: '#DDE9F5',
  },

  forgotBtn: { alignSelf: 'flex-end', marginTop: -8 },
  forgotText: { fontSize: 13, color: '#A527FF', fontWeight: '600' },

  submitBtn: {
    backgroundColor: '#A527FF', borderRadius: 16,
    paddingVertical: 16, alignItems: 'center',
    shadowColor: '#A527FF', shadowOpacity: 0.3, shadowRadius: 10, elevation: 4,
    marginTop: 4,
  },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
