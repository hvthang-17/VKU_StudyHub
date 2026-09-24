import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { COLORS } from '../constants';
import { useBookingStore } from '../store/useBookingStore';
import { authService } from '../services/authService';
import { isValidEmail } from '../utils/helpers';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const setUser = useBookingStore((s) => s.setUser);

  const handleLogin = async () => {
    setErr('');
    if (!email.trim() || !password) return setErr('Vui lòng nhập Email và Mật khẩu.');
    if (!isValidEmail(email)) return setErr('Email không hợp lệ.');
    setLoading(true);
    try {
      const u = await authService.login({ email, password });
      setUser(u);
    } catch (e: any) {
      setErr(e.message || 'Đăng nhập thất bại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={st.scroll} keyboardShouldPersistTaps="handled">
        <View style={st.heroSection}>
          <View style={st.heroBadge}>
            <Ionicons name="school" size={32} color="#FFFFFF" />
          </View>
          <Text style={st.heroTitle}>VKU StudyHub</Text>
          <Text style={st.heroSub}>Hệ thống đặt phòng học thông minh</Text>
        </View>

        <View style={st.card}>
          <Text style={st.cardTitle}>Đăng nhập sinh viên</Text>
          {err ? (
            <View style={st.errRow}>
              <Ionicons name="alert-circle" size={16} color={COLORS.danger} />
              <Text style={st.errTxt}>{err}</Text>
            </View>
          ) : null}

          <Text style={st.lbl}>Email sinh viên VKU</Text>
          <View style={st.inputWrap}>
            <Ionicons name="mail-outline" size={18} color={COLORS.textSecondary} style={st.inputIcon} />
            <TextInput style={st.inputField} placeholder="VD: sv@vku.udn.vn" placeholderTextColor={COLORS.textLight} keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
          </View>

          <Text style={st.lbl}>Mật khẩu</Text>
          <View style={st.inputWrap}>
            <Ionicons name="lock-closed-outline" size={18} color={COLORS.textSecondary} style={st.inputIcon} />
            <TextInput style={st.inputField} placeholder="Mật khẩu" placeholderTextColor={COLORS.textLight} secureTextEntry={!showPass} value={password} onChangeText={setPassword} />
            <TouchableOpacity style={st.eyeBtn} onPress={() => setShowPass(!showPass)} activeOpacity={0.7}>
              <Ionicons name={showPass ? 'eye-outline' : 'eye-off-outline'} size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={[st.btnMain, loading && st.btnMainLoading]} onPress={handleLogin} disabled={loading} activeOpacity={0.85}>
            {loading ? (
              <View style={st.btnRow}><ActivityIndicator color="#fff" size="small" /><Text style={st.btnMainTxt}>Đang xử lý…</Text></View>
            ) : (
              <View style={st.btnRow}><Ionicons name="log-in-outline" size={20} color="#FFFFFF" /><Text style={st.btnMainTxt}>Đăng Nhập</Text></View>
            )}
          </TouchableOpacity>

          <View style={st.divider}><View style={st.dividerLine} /><Text style={st.dividerTxt}>hoặc</Text><View style={st.dividerLine} /></View>

        </View>

        <View style={st.footer}>
          <Text style={st.footerTxt}>Chưa có tài khoản? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')} activeOpacity={0.7}>
            <Text style={st.footerLink}>Đăng ký ngay</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const st = StyleSheet.create({
  scroll: { flexGrow: 1, backgroundColor: COLORS.background, justifyContent: 'center', padding: 20 },
  heroSection: { alignItems: 'center', marginBottom: 28 },
  heroBadge: {
    width: 72, height: 72, borderRadius: 24, backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
    elevation: 6, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 14,
  },
  heroTitle: { fontSize: 28, fontWeight: '900', color: COLORS.text, letterSpacing: 0.5 },
  heroSub: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, elevation: 4,
    shadowColor: '#0F172A', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.08, shadowRadius: 20,
  },
  cardTitle: { fontSize: 19, fontWeight: '800', color: COLORS.text, marginBottom: 18 },
  errRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#FEF2F2', padding: 12, borderRadius: 14, marginBottom: 14, borderWidth: 1, borderColor: '#FECACA',
  },
  errTxt: { color: COLORS.danger, fontSize: 13, fontWeight: '600', flex: 1 },
  lbl: { fontSize: 13, fontWeight: '700', color: COLORS.gray700, marginBottom: 6 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 14, backgroundColor: '#F8FAFC', marginBottom: 16, paddingHorizontal: 2,
  },
  inputIcon: { marginLeft: 12 },
  inputField: { flex: 1, paddingVertical: 12, paddingHorizontal: 10, fontSize: 14, color: COLORS.text },
  eyeBtn: { paddingHorizontal: 12, paddingVertical: 10 },
  btnMain: {
    backgroundColor: COLORS.primary, borderRadius: 16, paddingVertical: 15, alignItems: 'center', marginTop: 4,
    elevation: 3, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 10,
  },
  btnMainLoading: { opacity: 0.85 },
  btnRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  btnMainTxt: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 18 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E5E7EB' },
  dividerTxt: { marginHorizontal: 12, fontSize: 12, color: COLORS.textSecondary, fontWeight: '600' },
  btnDemo: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#EFF6FF', borderRadius: 16, paddingVertical: 14, borderWidth: 1.5, borderColor: '#BFDBFE',
  },
  btnDemoTxt: { color: COLORS.primary, fontSize: 14, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerTxt: { fontSize: 14, color: COLORS.gray600 },
  footerLink: { fontSize: 14, fontWeight: '800', color: COLORS.primary },
});

