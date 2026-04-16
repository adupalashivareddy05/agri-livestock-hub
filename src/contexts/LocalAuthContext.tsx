import React, { createContext, useContext, useState, useEffect } from 'react';

export interface LocalUser {
  email: string;
  phone: string;
  password: string;
  fullName?: string;
  role?: string;
}

interface LocalAuthContextType {
  user: LocalUser | null;
  loading: boolean;
  signUp: (data: { email?: string; phone?: string; password: string; fullName?: string; role?: string }) => { error?: string };
  signIn: (identifier: string, password: string) => { error?: string };
  signOut: () => void;
}

const LocalAuthContext = createContext<LocalAuthContextType | undefined>(undefined);

export const useLocalAuth = () => {
  const context = useContext(LocalAuthContext);
  if (!context) throw new Error('useLocalAuth must be used within LocalAuthProvider');
  return context;
};

const getUsers = (): LocalUser[] => {
  try {
    return JSON.parse(localStorage.getItem('users') || '[]');
  } catch {
    return [];
  }
};

const saveUsers = (users: LocalUser[]) => {
  localStorage.setItem('users', JSON.stringify(users));
};

export const LocalAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) setUser(JSON.parse(stored));
    } catch {}
    setLoading(false);
  }, []);

  const signUp = (data: { email?: string; phone?: string; password: string; fullName?: string; role?: string }) => {
    const users = getUsers();
    const email = (data.email || '').trim().toLowerCase();
    const phone = (data.phone || '').trim();

    if (!email && !phone) return { error: 'Email or phone is required' };
    if (!data.password || data.password.length < 6) return { error: 'Password must be at least 6 characters' };

    const exists = users.some(
      u => (email && u.email === email) || (phone && u.phone === phone)
    );
    if (exists) return { error: 'User already exists with this email or phone' };

    const newUser: LocalUser = {
      email,
      phone,
      password: data.password,
      fullName: data.fullName,
      role: data.role,
    };
    users.push(newUser);
    saveUsers(users);

    const { password: _, ...safeUser } = newUser;
    const loggedUser = { ...safeUser, email: newUser.email, phone: newUser.phone } as LocalUser;
    localStorage.setItem('user', JSON.stringify(loggedUser));
    setUser(loggedUser);
    return {};
  };

  const signIn = (identifier: string, password: string) => {
    const users = getUsers();
    const id = identifier.trim().toLowerCase();

    const found = users.find(
      u => (u.email === id || u.phone === id) && u.password === password
    );
    if (!found) return { error: 'Invalid credentials' };

    const { password: _, ...safeUser } = found;
    const loggedUser = { ...safeUser, email: found.email, phone: found.phone } as LocalUser;
    localStorage.setItem('user', JSON.stringify(loggedUser));
    setUser(loggedUser);
    return {};
  };

  const signOut = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <LocalAuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </LocalAuthContext.Provider>
  );
};
