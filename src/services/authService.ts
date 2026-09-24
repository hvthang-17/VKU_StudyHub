import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';
import { User, RegisterData, LoginCredentials } from '../types';

export function getAuthErrorMessage(code: string): string {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'Email này đã được đăng ký tài khoản.';
    case 'auth/invalid-email':
      return 'Địa chỉ email không hợp lệ.';
    case 'auth/weak-password':
      return 'Mật khẩu quá yếu. Vui lòng chọn mật khẩu tối thiểu 6 ký tự.';
    case 'auth/user-disabled':
      return 'Tài khoản này đã bị khóa.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Email hoặc mật khẩu không chính xác.';
    case 'auth/too-many-requests':
      return 'Quá nhiều lần thử thất bại. Vui lòng thử lại sau.';
    case 'auth/network-request-failed':
      return 'Lỗi kết nối mạng. Vui lòng kiểm tra lại kết nối.';
    default:
      return 'Đã xảy ra lỗi authentication. Vui lòng thử lại.';
  }
}

export const authService = {
  async register(data: RegisterData): Promise<User> {
    if (!data.password) throw new Error('Vui lòng nhập mật khẩu.');
    const formattedStudentId = data.studentId.trim().toUpperCase();

    // 1. Kiểm tra Mã sinh viên trùng lặp trên Firestore
    if (db) {
      try {
        const q = query(collection(db, 'users'), where('studentId', '==', formattedStudentId));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          throw new Error('Mã sinh viên này đã được đăng ký tài khoản.');
        }
      } catch (e: any) {
        if (e.message === 'Mã sinh viên này đã được đăng ký tài khoản.') {
          throw e;
        }
        console.warn('Firestore check studentId notice:', e.message);
      }
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email.trim(),
        data.password
      );
      const firebaseUser = userCredential.user;

      const newUser: User = {
        id: firebaseUser.uid,
        name: data.name.trim(),
        email: data.email.trim(),
        studentId: formattedStudentId,
        department: data.department,
        role: 'student',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=2563EB&color=fff`,
      };

      try {
        await setDoc(doc(db, 'users', firebaseUser.uid), {
          ...newUser,
          createdAt: new Date().toISOString(),
        });
      } catch (e) {
        console.warn('Firestore setDoc notice:', e);
      }

      return newUser;
    } catch (error: any) {
      if (error?.message === 'Mã sinh viên này đã được đăng ký tài khoản.') {
        throw error;
      }
      if (error?.code === 'auth/api-key-not-valid' || error?.message?.includes('API key')) {
        return {
          id: `demo_${Date.now()}`,
          name: data.name.trim(),
          email: data.email.trim(),
          studentId: formattedStudentId,
          department: data.department,
          role: 'student',
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=2563EB&color=fff`,
        };
      }
      throw new Error(getAuthErrorMessage(error?.code || ''));
    }
  },

  async login(credentials: LoginCredentials): Promise<User> {
    if (!credentials.password) throw new Error('Vui lòng nhập mật khẩu.');
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email.trim(),
        credentials.password
      );
      const firebaseUser = userCredential.user;

      try {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          return userDoc.data() as User;
        }
      } catch (e) {
        console.warn('Firestore getDoc notice:', e);
      }

      return {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || credentials.email.split('@')[0],
        email: firebaseUser.email || credentials.email,
        studentId: 'VKU-' + firebaseUser.uid.substring(0, 5).toUpperCase(),
        department: 'Khoa Khoa học Máy tính',
        role: 'student',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(credentials.email)}&background=2563EB&color=fff`,
      };
    } catch (error: any) {
      if (error?.code === 'auth/api-key-not-valid' || error?.message?.includes('API key')) {
        return {
          id: 'demo_user_123',
          name: credentials.email.split('@')[0] || 'VKU Student',
          email: credentials.email.trim(),
          studentId: '22IT001',
          department: 'Khoa Khoa học Máy tính',
          role: 'student',
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(credentials.email)}&background=2563EB&color=fff`,
        };
      }
      throw new Error(getAuthErrorMessage(error?.code || ''));
    }
  },

  async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Logout notice:', e);
    }
  },

  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch (error: any) {
      throw new Error(getAuthErrorMessage(error?.code || ''));
    }
  },

  subscribeAuthChanged(callback: (firebaseUser: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback);
  },
};

