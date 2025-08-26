import { create } from 'zustand';
import { authStorage, type AuthUser, isTokenExpired } from '@/lib/auth';
import { api } from '@/lib/api';

interface LoginCredentials {
  identifier: string;
  password: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  initialize: () => Promise<void>;
  clearError: () => void;
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  clearError: () => set({ error: null }),

  login: async (credentials: LoginCredentials) => {
    try {
      set({ isLoading: true, error: null });
      
      console.log('Attempting login with:', { identifier: credentials.identifier });
      
      const response = await api.login(credentials);
      
      console.log('Login response received:', { 
        hasAccessToken: !!response.access_token,
        hasRefreshToken: !!response.refresh_token,
        tokenType: response.token_type 
      });

      // Store tokens
      authStorage.setToken(response.access_token);
      authStorage.setRefreshToken(response.refresh_token);

      try {
        // Fetch user profile separately
        const user = await api.getMe();
        console.log('User profile fetched:', user);
        
        authStorage.setUser(user);

        set({
          user,
          token: response.access_token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } catch (userError) {
        console.error('Failed to fetch user profile:', userError);
        // If we can't get user profile but login succeeded, still consider it successful
        // You might want to handle this differently based on your requirements
        set({
          user: null,
          token: response.access_token,
          isAuthenticated: true,
          isLoading: false,
          error: 'Login successful but could not load user profile',
        });
      }
    } catch (error) {
      console.error('Login failed:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Login failed'
      });
      throw error;
    }
  },

  logout: () => {
    authStorage.clear();
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  },

  initialize: async () => {
    try {
      set({ isLoading: true });
      
      const token = authStorage.getToken();
      const refreshToken = authStorage.getRefreshToken();
      
      if (!token) {
        set({ isLoading: false });
        return;
      }

      // Check if token is expired
      if (isTokenExpired(token)) {
        // The apiRequest interceptor will handle the refresh
        // We just need to clear local storage if refresh fails
        try {
          const user = await api.getMe();
          authStorage.setUser(user);
          set({
            user,
            token: authStorage.getToken(),
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          console.error("Failed to refresh and get user, logging out.", error);
          authStorage.clear();
          set({ isLoading: false });
        }
        return;
      }

      // Token is valid, use stored user data
      const user = authStorage.getUser();
      if (user) {
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        // If for some reason user is not in storage, fetch it
        try {
          const fetchedUser = await api.getMe();
          authStorage.setUser(fetchedUser);
          set({
            user: fetchedUser,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (err) {
          console.error("Failed to fetch current user:", err);
          authStorage.clear();
          set({ isLoading: false });
        }
      }
    } catch (err) {
      console.error("Failed to initialize auth:", err);
      authStorage.clear();
      set({ isLoading: false });
    }
  },
}));
