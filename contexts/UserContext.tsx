
import React, { createContext, useContext, useState } from 'react';
import { BrandVoice, User, ToolType } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface UserContextType {
  user: User;
  updateUser: (updates: Partial<User>) => void;
  brandVoices: BrandVoice[];
  addBrandVoice: (voice: BrandVoice) => void;
  removeBrandVoice: (id: string) => void;
  selectedVoiceId: string | null;
  setSelectedVoiceId: (id: string | null) => void;
  toggleLinkedAccount: (platform: keyof User['linkedAccounts']) => void;
  toggleFavoriteTool: (toolId: ToolType) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const DEFAULT_VOICES: BrandVoice[] = [
  { id: 'v1', name: 'Professional', description: 'Formal, objective, and grammatically perfect. Suitable for business reports.' },
  { id: 'v2', name: 'Friendly & Witty', description: 'Casual, engaging, and uses humor where appropriate. Good for social media.' },
  { id: 'v3', name: 'Persuasive Sales', description: 'Action-oriented, urgent, and focuses on benefits. Perfect for marketing copy.' }
];

const INITIAL_USER: User = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  plan: 'pro',
  bio: 'Content Marketing Manager obsessed with efficiency.',
  linkedAccounts: {
    twitter: false,
    linkedin: false,
    instagram: false
  },
  favorites: []
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useLocalStorage<User>('ai_writer_user', INITIAL_USER);
  const [brandVoices, setBrandVoices] = useLocalStorage<BrandVoice[]>('ai_writer_voices', DEFAULT_VOICES);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string | null>(null);

  const addBrandVoice = (voice: BrandVoice) => {
    setBrandVoices(prev => [...prev, voice]);
  };

  const removeBrandVoice = (id: string) => {
    setBrandVoices(prev => prev.filter(v => v.id !== id));
    if (selectedVoiceId === id) setSelectedVoiceId(null);
  };

  const updateUser = (updates: Partial<User>) => {
    setUser(prev => ({ ...prev, ...updates }));
  };

  const toggleLinkedAccount = (platform: keyof User['linkedAccounts']) => {
    setUser(prev => ({
      ...prev,
      linkedAccounts: {
        ...prev.linkedAccounts,
        [platform]: !prev.linkedAccounts[platform]
      }
    }));
  };

  const toggleFavoriteTool = (toolId: ToolType) => {
    setUser(prev => {
        const favorites = prev.favorites || [];
        if (favorites.includes(toolId)) {
            return { ...prev, favorites: favorites.filter(id => id !== toolId) };
        } else {
            return { ...prev, favorites: [...favorites, toolId] };
        }
    });
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
        window.localStorage.removeItem('ai_writer_user');
        window.location.href = '/'; 
    }
  };

  return (
    <UserContext.Provider value={{ 
      user,
      updateUser,
      brandVoices, 
      addBrandVoice, 
      removeBrandVoice,
      selectedVoiceId,
      setSelectedVoiceId,
      toggleLinkedAccount,
      toggleFavoriteTool,
      logout
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
