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
  teacherProfile?: {
    id: string;
    teacherCode: string;
    designation?: string;
  };
}

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: UserProfile, token: string, refreshToken?: string) => void;
  updateUser: (data: Partial<UserProfile>) => void;
  logout: () => void;
  checkAuth: () => void;
}

const safeParseUser = (): UserProfile | null => {
  try {
    const raw = localStorage.getItem('school_saas_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  user: safeParseUser(),
  token: localStorage.getItem('school_saas_access_token'),
  refreshToken: localStorage.getItem('school_saas_refresh_token'),
  isAuthenticated: !!localStorage.getItem('school_saas_access_token'),

  setAuth: (user, token, refreshToken) => {
    try {
      localStorage.setItem('school_saas_user', JSON.stringify(user));
      localStorage.setItem('school_saas_access_token', token);
      if (refreshToken) {
        localStorage.setItem('school_saas_refresh_token', refreshToken);
      }
    } catch (e) {
      console.warn('Could not persist auth to localStorage', e);
    }
    set({ user, token, refreshToken: refreshToken || null, isAuthenticated: true });
  },

  updateUser: (data) => {
    set((state) => {
      if (!state.user) return state;
      const updated = { ...state.user, ...data };
      try {
        localStorage.setItem('school_saas_user', JSON.stringify(updated));
      } catch (e) {
        console.warn('Could not update user in localStorage', e);
      }
      return { user: updated };
    });
  },

  logout: () => {
    try {
      localStorage.removeItem('school_saas_user');
      localStorage.removeItem('school_saas_access_token');
      localStorage.removeItem('school_saas_refresh_token');
    } catch {}
    set({ user: null, token: null, refreshToken: null, isAuthenticated: false });
  },

  checkAuth: () => {
    const token = localStorage.getItem('school_saas_access_token');
    const user = safeParseUser();
    set({ user, token, isAuthenticated: !!token && !!user });
  },
}));
