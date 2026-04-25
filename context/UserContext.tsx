import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { mockUser } from '../constants/mockData';

export type UserData = typeof mockUser;

interface UserContextType {
  user: UserData;
  updateUser: (data: Partial<UserData>) => void;
  updateCar: (data: Partial<UserData['car']>) => void;
  loading: boolean;
}

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData>(mockUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        setUser(mockUser);
        setLoading(false);
        return;
      }

      const ref = doc(db, 'users', firebaseUser.uid);
      const unsubDoc = onSnapshot(ref, async (snap) => {
        if (!snap.exists()) {
          // Create the document if missing (e.g. older accounts)
          await setDoc(ref, {
            username: firebaseUser.email?.split('@')[0] ?? 'Skrr User',
            city: '',
            skrrId: Math.random().toString(36).substr(2, 6).toUpperCase(),
            car: {},
            following: [],
            meetsAttended: 0,
            meetsHosted: 0,
          });
          setUser({ ...mockUser, id: firebaseUser.uid });
          setLoading(false);
          return;
        }
        const data = snap.data();
        setUser({
          ...mockUser,
          id: firebaseUser.uid,
          skrrId: data.skrrId ?? mockUser.skrrId,
          username: data.username ?? mockUser.username,
          location: data.city ?? mockUser.location,
          profilePhoto: data.profilePhoto ?? null,
          car: {
            ...mockUser.car,
            year: Number(data.car?.year) || mockUser.car.year,
            make: data.car?.make ?? mockUser.car.make,
            model: data.car?.model ?? mockUser.car.model,
            photo: data.car?.photo ?? null,
            hp: Number(data.car?.hp) || 0,
            torque: Number(data.car?.torque) || 0,
            mods: data.car?.mods ?? [],
            zeroToSixty: data.car?.zeroToSixty ?? '',
            drivetrain: data.car?.drivetrain ?? '',
            engine: data.car?.engine ?? '',
          },
          stats: {
            ...mockUser.stats,
            meetsAttended: data.meetsAttended ?? 0,
            meetsHosted: data.meetsHosted ?? 0,
            friends: (data.following ?? []).length,
            rating: data.rating ?? 0,
          },
          rank: '',
          cardStyle: data.cardStyle ?? mockUser.cardStyle,
        });
        setLoading(false);
      });

      return () => unsubDoc();
    });

    return () => unsubAuth();
  }, []);

  const updateUser = (data: Partial<UserData>) => {
    setUser((prev) => ({ ...prev, ...data }));
  };

  const updateCar = (data: Partial<UserData['car']>) => {
    setUser((prev) => ({ ...prev, car: { ...prev.car, ...data } }));
  };

  return (
    <UserContext.Provider value={{ user, updateUser, updateCar, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}
