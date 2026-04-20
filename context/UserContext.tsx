import React, { createContext, useContext, useState } from 'react';
import { mockUser } from '../constants/mockData';

export type UserData = typeof mockUser;

interface UserContextType {
  user: UserData;
  updateUser: (data: Partial<UserData>) => void;
  updateCar: (data: Partial<UserData['car']>) => void;
}

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData>(mockUser);

  const updateUser = (data: Partial<UserData>) => {
    setUser((prev) => ({ ...prev, ...data }));
  };

  const updateCar = (data: Partial<UserData['car']>) => {
    setUser((prev) => ({ ...prev, car: { ...prev.car, ...data } }));
  };

  return (
    <UserContext.Provider value={{ user, updateUser, updateCar }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}
