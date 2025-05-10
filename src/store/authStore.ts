import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  isAuthenticated: boolean;
  username: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (username: string) => boolean;
  updatePassword: (currentPassword: string, newPassword: string) => boolean;
}

const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin'
};

// const backendURL = 'http://localhost:8000';
const backendURL = 'http://168.231.66.208:8000';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      username: null,

      login: async (username, password) => {
        try {
          const response = await fetch(backendURL + "/login/", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password }),
          });

          if (!response.ok) {
            return false; // login failed
          }

          const data = await response.json();

          // If login is successful, store authentication state
          set({ isAuthenticated: true, username }); // optionally store token too
          return true;
        } catch (error) {
          console.error("Login error:", error);
          return false;
        }
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