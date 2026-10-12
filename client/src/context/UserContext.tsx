import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export interface User {
  name: string;
  userId: string;
  avatar: string;
}

interface UserContextProps {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (updatedUser: User) => void;
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('marvelUser');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed);
        localStorage.setItem('dynasty_display_name', parsed.name);
        localStorage.setItem('dynasty_avatar', parsed.avatar);
        if (!localStorage.getItem('dynasty_player_id')) {
          localStorage.setItem('dynasty_player_id', parsed.userId);
        }
      } catch (_) {}
    }
  }, []);

  const login = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('marvelUser', JSON.stringify(newUser));
    localStorage.setItem('dynasty_display_name', newUser.name);
    localStorage.setItem('dynasty_avatar', newUser.avatar);
    localStorage.setItem('dynasty_player_id', newUser.userId);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('marvelUser', JSON.stringify(updatedUser));
    localStorage.setItem('dynasty_display_name', updatedUser.name);
    localStorage.setItem('dynasty_avatar', updatedUser.avatar);
    // Keep existing player ID intact so identity & auction ownership are preserved
    if (!localStorage.getItem('dynasty_player_id')) {
      localStorage.setItem('dynasty_player_id', updatedUser.userId);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('marvelUser');
    localStorage.removeItem('dynasty_display_name');
    localStorage.removeItem('dynasty_avatar');
    localStorage.removeItem('dynasty_player_id');
  };

  return (
    <UserContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextProps => {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return ctx;
};
