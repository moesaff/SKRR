import { initializeApp, getApps } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: 'AIzaSyBHj4FQyZeC6xLfLDLD12V3UMrSqwGYb6A',
  authDomain: 'skrr-24d7d.firebaseapp.com',
  projectId: 'skrr-24d7d',
  storageBucket: 'skrr-24d7d.firebasestorage.app',
  messagingSenderId: '841925184747',
  appId: '1:841925184747:web:5eecbbe5b6202475dc42ae',
  measurementId: 'G-XZS05790QN',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

let _auth;
try {
  _auth = initializeAuth(app, { persistence: getReactNativePersistence(ReactNativeAsyncStorage) });
} catch {
  _auth = getAuth(app);
}
export const auth = _auth;
export const db = getFirestore(app, 'default');
export const storage = getStorage(app);
