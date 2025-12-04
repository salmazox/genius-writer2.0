import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { UserProvider, useUser } from './UserContext';
import { ToolType } from '../types';
import React from 'react';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('UserContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <UserProvider>{children}</UserProvider>
  );

  describe('User Management', () => {
    it('should provide initial user data', () => {
      const { result } = renderHook(() => useUser(), { wrapper });

      expect(result.current.user).toBeDefined();
      expect(result.current.user.name).toBe('John Doe');
      expect(result.current.user.email).toBe('john.doe@example.com');
      expect(result.current.user.plan).toBe('pro');
    });

    it('should update user data', () => {
      const { result } = renderHook(() => useUser(), { wrapper });

      act(() => {
        result.current.updateUser({
          name: 'Jane Smith',
          email: 'jane@example.com',
        });
      });

      expect(result.current.user.name).toBe('Jane Smith');
      expect(result.current.user.email).toBe('jane@example.com');
      expect(result.current.user.plan).toBe('pro'); // Should retain other properties
    });

    it('should update user plan', () => {
      const { result } = renderHook(() => useUser(), { wrapper });

      act(() => {
        result.current.updateUser({ plan: 'enterprise' });
      });

      expect(result.current.user.plan).toBe('enterprise');
    });

    it('should update user bio', () => {
      const { result } = renderHook(() => useUser(), { wrapper });

      act(() => {
        result.current.updateUser({ bio: 'New bio description' });
      });

      expect(result.current.user.bio).toBe('New bio description');
    });
  });

  describe('Linked Accounts', () => {
    it('should toggle Twitter account', () => {
      const { result } = renderHook(() => useUser(), { wrapper });

      const initialState = result.current.user.linkedAccounts.twitter;

      act(() => {
        result.current.toggleLinkedAccount('twitter');
      });

      expect(result.current.user.linkedAccounts.twitter).toBe(!initialState);
    });

    it('should toggle LinkedIn account', () => {
      const { result } = renderHook(() => useUser(), { wrapper });

      const initialState = result.current.user.linkedAccounts.linkedin;

      act(() => {
        result.current.toggleLinkedAccount('linkedin');
      });

      expect(result.current.user.linkedAccounts.linkedin).toBe(!initialState);
    });

    it('should toggle Instagram account', () => {
      const { result } = renderHook(() => useUser(), { wrapper });

      const initialState = result.current.user.linkedAccounts.instagram;

      act(() => {
        result.current.toggleLinkedAccount('instagram');
      });

      expect(result.current.user.linkedAccounts.instagram).toBe(!initialState);
    });

    it('should toggle account multiple times', () => {
      const { result } = renderHook(() => useUser(), { wrapper });

      act(() => {
        result.current.toggleLinkedAccount('twitter');
      });
      expect(result.current.user.linkedAccounts.twitter).toBe(true);

      act(() => {
        result.current.toggleLinkedAccount('twitter');
      });
      expect(result.current.user.linkedAccounts.twitter).toBe(false);
    });
  });

  describe('Favorite Tools', () => {
    it('should add tool to favorites', () => {
      const { result } = renderHook(() => useUser(), { wrapper });

      act(() => {
        result.current.toggleFavoriteTool(ToolType.SMART_EDITOR);
      });

      expect(result.current.user.favorites).toContain(ToolType.SMART_EDITOR);
    });

    it('should remove tool from favorites', () => {
      const { result } = renderHook(() => useUser(), { wrapper });

      act(() => {
        result.current.toggleFavoriteTool(ToolType.SMART_EDITOR);
      });
      expect(result.current.user.favorites).toContain(ToolType.SMART_EDITOR);

      act(() => {
        result.current.toggleFavoriteTool(ToolType.SMART_EDITOR);
      });
      expect(result.current.user.favorites).not.toContain(ToolType.SMART_EDITOR);
    });

    it('should handle multiple favorite tools', () => {
      const { result } = renderHook(() => useUser(), { wrapper });

      act(() => {
        result.current.toggleFavoriteTool(ToolType.SMART_EDITOR);
        result.current.toggleFavoriteTool(ToolType.TRANSLATOR);
        result.current.toggleFavoriteTool(ToolType.CV_BUILDER);
      });

      expect(result.current.user.favorites).toHaveLength(3);
      expect(result.current.user.favorites).toContain(ToolType.SMART_EDITOR);
      expect(result.current.user.favorites).toContain(ToolType.TRANSLATOR);
      expect(result.current.user.favorites).toContain(ToolType.CV_BUILDER);
    });
  });

  describe('Brand Voices', () => {
    it('should provide default brand voices', () => {
      const { result } = renderHook(() => useUser(), { wrapper });

      expect(result.current.brandVoices).toHaveLength(3);
      expect(result.current.brandVoices[0].name).toBe('Professional');
      expect(result.current.brandVoices[1].name).toBe('Friendly & Witty');
      expect(result.current.brandVoices[2].name).toBe('Persuasive Sales');
    });

    it('should add a new brand voice', () => {
      const { result } = renderHook(() => useUser(), { wrapper });

      const newVoice = {
        id: 'v4',
        name: 'Technical',
        description: 'Precise and technical language for documentation',
      };

      act(() => {
        result.current.addBrandVoice(newVoice);
      });

      expect(result.current.brandVoices).toHaveLength(4);
      expect(result.current.brandVoices).toContainEqual(newVoice);
    });

    it('should remove a brand voice', () => {
      const { result } = renderHook(() => useUser(), { wrapper });

      const initialLength = result.current.brandVoices.length;

      act(() => {
        result.current.removeBrandVoice('v1');
      });

      expect(result.current.brandVoices).toHaveLength(initialLength - 1);
      expect(result.current.brandVoices.find((v) => v.id === 'v1')).toBeUndefined();
    });

    it('should clear selected voice when removing it', () => {
      const { result } = renderHook(() => useUser(), { wrapper });

      act(() => {
        result.current.setSelectedVoiceId('v1');
      });
      expect(result.current.selectedVoiceId).toBe('v1');

      act(() => {
        result.current.removeBrandVoice('v1');
      });
      expect(result.current.selectedVoiceId).toBeNull();
    });

    it('should set selected voice', () => {
      const { result } = renderHook(() => useUser(), { wrapper });

      act(() => {
        result.current.setSelectedVoiceId('v2');
      });

      expect(result.current.selectedVoiceId).toBe('v2');
    });

    it('should clear selected voice', () => {
      const { result } = renderHook(() => useUser(), { wrapper });

      act(() => {
        result.current.setSelectedVoiceId('v2');
      });
      expect(result.current.selectedVoiceId).toBe('v2');

      act(() => {
        result.current.setSelectedVoiceId(null);
      });
      expect(result.current.selectedVoiceId).toBeNull();
    });
  });

  describe('Logout', () => {
    it('should clear user data on logout', () => {
      const { result } = renderHook(() => useUser(), { wrapper });

      act(() => {
        result.current.updateUser({ name: 'Test User' });
        result.current.toggleFavoriteTool(ToolType.SMART_EDITOR);
      });

      act(() => {
        result.current.logout();
      });

      // After logout, user should be reset to initial state
      expect(result.current.user.name).toBe('John Doe');
      expect(result.current.user.favorites).toHaveLength(0);
    });
  });

  describe('Persistence', () => {
    it('should persist user data to localStorage', () => {
      const { result } = renderHook(() => useUser(), { wrapper });

      act(() => {
        result.current.updateUser({ name: 'Persisted User' });
      });

      const stored = localStorage.getItem('ai_writer_user');
      expect(stored).toBeDefined();
      const parsed = JSON.parse(stored!);
      expect(parsed.name).toBe('Persisted User');
    });

    it('should persist brand voices to localStorage', () => {
      const { result } = renderHook(() => useUser(), { wrapper });

      const newVoice = {
        id: 'v10',
        name: 'Custom',
        description: 'Custom brand voice',
      };

      act(() => {
        result.current.addBrandVoice(newVoice);
      });

      const stored = localStorage.getItem('ai_writer_voices');
      expect(stored).toBeDefined();
      const parsed = JSON.parse(stored!);
      expect(parsed.find((v: any) => v.id === 'v10')).toBeDefined();
    });
  });
});
