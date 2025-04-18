import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  isAuthenticated: boolean;
  username: string | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  updateProfile: (username: string) => boolean;
  updatePassword: (currentPassword: string, newPassword: string) => boolean;
}

const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin'
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      username: null,
      login: (username, password) => {
        if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
          set({ isAuthenticated: true, username });
          return true;
        }
        return false;
      },
      logout: () => {
        set({ isAuthenticated: false, username: null });
      },
      updateProfile: (username) => {
        ADMIN_CREDENTIALS.username = username;
        set({ username });
        return true;
      },
      updatePassword: (currentPassword, newPassword) => {
        if (currentPassword === ADMIN_CREDENTIALS.password) {
          ADMIN_CREDENTIALS.password = newPassword;
          return true;
        }
        return false;
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        username: state.username
      })
    }
  )
);