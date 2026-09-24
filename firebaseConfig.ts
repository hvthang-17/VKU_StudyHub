// ============================================================
// VKU StudyHub – Firebase Configuration
// ============================================================
import { initializeApp, getApps, getApp } from 'firebase/app';
// @ts-ignore - getReactNativePersistence tồn tại ở runtime, chỉ thiếu type declaration
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';


const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// initializeAuth() chỉ được gọi 1 lần cho mỗi app. Nếu Fast Refresh
// chạy lại module này, cần fallback về getAuth() thay vì gọi
// initializeAuth() lần 2 (sẽ throw error).
export const auth = (() => {
  try {
    return initializeAuth(app, {
      persistence: Platform.OS === 'web'
        ? undefined
        : getReactNativePersistence(AsyncStorage),
    });
  } catch (error) {
    return getAuth(app);
  }
})();

export const db = getFirestore(app);

export default app;