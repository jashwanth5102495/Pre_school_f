import { create } from 'zustand';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: string;
  status: string;
  userType: 'PLATFORM' | 'SCHOOL';
  schoolId?: string;
  schoolName?: string;
}

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: UserProfile, token: string, refreshToken?: string) => void;
  logout: () => void;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: JSON.parse(localStorage.getItem('school_saas_user') || 'null'),
  token: localStorage.getItem('school_saas_access_token'),
  isAuthenticated: !!localStorage.getItem('school_saas_access_token'),

  setAuth: (user, token, refreshToken) => {
    localStorage.setItem('school_saas_user', JSON.stringify(user));
    localStorage.setItem('school_saas_access_token', token);
    if (refreshToken) {
      localStorage.setItem('school_saas_refresh_token', refreshToken);
    }
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('school_saas_user');
    localStorage.removeItem('school_saas_access_token');
    localStorage.removeItem('school_saas_refresh_token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  checkAuth: () => {
    const token = localStorage.getItem('school_saas_access_token');
    const user = JSON.parse(localStorage.getItem('school_saas_user') || 'null');
    set({ user, token, isAuthenticated: !!token });
  },
}));
