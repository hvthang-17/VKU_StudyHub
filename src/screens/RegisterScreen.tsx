import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { COLORS, DEPARTMENTS } from '../constants';
import { useBookingStore } from '../store/useBookingStore';
import { authService } from '../services/authService';
import { isValidEmail, isValidStudentId } from '../utils/helpers';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [studentId, setStudentId] = useState('');
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const setUser = useBookingStore((s) => s.setUser);

  const handleRegister = async () => {
    setErr('');
    if (!name.trim() || !email.trim() || !studentId.trim() || !password || !confirmPass) {
      return setErr('Vui lòng điền đầy đủ các thông tin.');
    }
    if (!isValidEmail(email)) return setErr('Email không hợp lệ.');
    if (!isValidStudentId(studentId)) return setErr('Mã sinh viên không đúng định dạng (VD: 22IT001).');
    if (password.length < 6) return setErr('Mật khẩu phải có tối thiểu 6 ký tự.');
    if (password !== confirmPass) return setErr('Mật khẩu nhập lại không khớp.');

    setLoading(true);
    try {
      const user = await authService.register({
        name,
        email,
        studentId,
        department,
        password,
      });
      setUser(user);
    } catch (e: any) {
      setErr(e.message || 'Đăng ký thất bại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={st.scroll} keyboardShouldPersistTaps="handled">
        <View style={st.heroSection}>
          <View style={st.heroBadge}>
            <Ionicons name="person-add" size={28} color="#FFFFFF" />
          </View>
          <Text style={st.heroTitle}>Tạo tài khoản</Text>
          <Text style={st.heroSub}>Đăng ký để sử dụng VKU StudyHub</Text>
        </View>

        <View style={st.card}>
          {err ? (
            <View style={st.errRow}>
              <Ionicons name="alert-circle" size={16} color={COLORS.danger} />
              <Text style={st.errTxt}>{err}</Text>
            </View>
          ) : null}

          <Text style={st.lbl}>Họ và tên *</Text>
          <View style={st.inputWrap}>
            <Ionicons name="person-outline" size={18} color={COLORS.textSecondary} style={st.inputIcon} />
            <TextInput style={st.inputField} placeholder="VD: Nguyễn Văn A" placeholderTextColor={COLORS.textLight} value={name} onChangeText={setName} />
          </View>

          <Text style={st.lbl}>Email sinh viên VKU *</Text>
          <View style={st.inputWrap}>
            <Ionicons name="mail-outline" size={18} color={COLORS.textSecondary} style={st.inputIcon} />
            <TextInput style={st.inputField} placeholder="VD: sv@vku.udn.vn" placeholderTextColor={COLORS.textLight} keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
          </View>

          <Text style={st.lbl}>Mã sinh viên *</Text>
          <View style={st.inputWrap}>
            <Ionicons name="id-card-outline" size={18} color={COLORS.textSecondary} style={st.inputIcon} />
            <TextInput style={st.inputField} placeholder="VD: 22IT001" placeholderTextColor={COLORS.textLight} autoCapitalize="characters" value={studentId} onChangeText={setStudentId} />
          </View>

          <Text style={st.lbl}>Khoa chuyên ngành *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }} contentContainerStyle={{ gap: 8 }}>
            {DEPARTMENTS.map((dept) => (
              <TouchableOpacity key={dept} style={[st.deptChip, department === dept && st.deptChipActive]} onPress={() => setDepartment(dept)} activeOpacity={0.8}>
                <Ionicons name={department === dept ? 'checkmark-circle' : 'ellipse-outline'} size={16} color={department === dept ? '#FFFFFF' : COLORS.textSecondary} />
                <Text style={[st.deptChipTxt, department === dept && st.deptChipTxtActive]}>{dept}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={st.lbl}>Mật khẩu (tối thiểu 6 ký tự) *</Text>
          <View style={st.inputWrap}>
            <Ionicons name="lock-closed-outline" size={18} color={COLORS.textSecondary} style={st.inputIcon} />
            <TextInput style={st.inputField} placeholder="Nhập mật khẩu" placeholderTextColor={COLORS.textLight} secureTextEntry value={password} onChangeText={setPassword} />
          </View>

          <Text style={st.lbl}>Xác nhận mật khẩu *</Text>
          <View style={st.inputWrap}>
            <Ionicons name="lock-open-outline" size={18} color={COLORS.textSecondary} style={st.inputIcon} />
            <TextInput style={st.inputField} placeholder="Nhập lại mật khẩu" placeholderTextColor={COLORS.textLight} secureTextEntry value={confirmPass} onChangeText={setConfirmPass} />
          </View>

          <TouchableOpacity style={[st.btnMain, loading && st.btnMainLoading]} onPress={handleRegister} disabled={loading} activeOpacity={0.85}>
            {loading ? (
              <View style={st.btnRow}><ActivityIndicator color="#fff" size="small" /><Text style={st.btnMainTxt}>Đang tạo…</Text></View>
            ) : (
              <View style={st.btnRow}><Ionicons name="checkmark-done" size={20} color="#FFFFFF" /><Text style={st.btnMainTxt}>Tạo Tài Khoản</Text></View>
            )}
          </TouchableOpacity>
        </View>

        <View style={st.footer}>
          <Text style={st.footerTxt}>Đã có tài khoản? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')} activeOpacity={0.7}>
            <Text style={st.footerLink}>Đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const st = StyleSheet.create({
  scroll: { flexGrow: 1, backgroundColor: COLORS.background, justifyContent: 'center', padding: 20 },
  heroSection: { alignItems: 'center', marginBottom: 24 },
  heroBadge: {
    width: 68, height: 68, borderRadius: 22, backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center', marginBottom: 10,
    elevation: 6, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 14,
  },
  heroTitle: { fontSize: 24, fontWeight: '900', color: COLORS.text },
  heroSub: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, elevation: 4,
    shadowColor: '#0F172A', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.08, shadowRadius: 20,
  },
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
  deptChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, backgroundColor: '#F1F5F9', borderWidth: 1.5, borderColor: COLORS.border,
  },
  deptChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  deptChipTxt: { fontSize: 12, color: COLORS.gray700, fontWeight: '600' },
  deptChipTxtActive: { color: '#FFFFFF', fontWeight: '800' },
  btnMain: {
    backgroundColor: COLORS.primary, borderRadius: 16, paddingVertical: 15, alignItems: 'center', marginTop: 4,
    elevation: 3, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 10,
  },
  btnMainLoading: { opacity: 0.85 },
  btnRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  btnMainTxt: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerTxt: { fontSize: 14, color: COLORS.gray600 },
  footerLink: { fontSize: 14, fontWeight: '800', color: COLORS.primary },
});

