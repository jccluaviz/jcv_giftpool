import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { storageService } from '../services/storage';

interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string) => Promise<void>;
  register: (user: Omit<User, 'id'>) => Promise<void>;
  logout: () => void;
  updateProfile: (user: User) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children?: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedId = localStorage.getItem('gp_current_user_id');
    if (storedId) {
      const users = storageService.getUsers();
      const found = users.find(u => u.id === storedId);
      if (found) setUser(found);
    }
  }, []);

  const login = async (email: string, pass: string) => {
    const loggedUser = await storageService.login(email, pass);
    setUser(loggedUser);
    localStorage.setItem('gp_current_user_id', loggedUser.id);
  };

  const register = async (userData: Omit<User, 'id'>) => {
    const newUser = await storageService.register(userData);
    setUser(newUser);
    localStorage.setItem('gp_current_user_id', newUser.id);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('gp_current_user_id');
  };

  const updateProfile = async (updatedUser: User) => {
    await storageService.updateUser(updatedUser);
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};