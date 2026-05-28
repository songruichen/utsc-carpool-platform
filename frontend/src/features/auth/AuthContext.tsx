import { useCallback, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { AuthContext } from '@/features/auth/AuthStateContext';
import { login as loginRequest, register as registerRequest } from '@/lib/api/auth';
import type { AuthResponse, AuthUser, LoginRequest, RegisterRequest } from '@/types/api';

const TOKEN_KEY = 'accessToken';
const USER_KEY = 'authUser';

function getStoredUser(): AuthUser | null {
  const stored = localStorage.getItem(USER_KEY);

  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored) as AuthUser;
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

function persistAuth(auth: AuthResponse) {
  localStorage.setItem(TOKEN_KEY, auth.accessToken);
  localStorage.setItem(USER_KEY, JSON.stringify(auth.user));
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());

  const applyAuth = useCallback((auth: AuthResponse) => {
    persistAuth(auth);
    setToken(auth.accessToken);
    setUser(auth.user);
  }, []);

  const login = useCallback(
    async (request: LoginRequest) => {
      applyAuth(await loginRequest(request));
    },
    [applyAuth]
  );

  const register = useCallback(
    async (request: RegisterRequest) => {
      applyAuth(await registerRequest(request));
    },
    [applyAuth]
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      logout
    }),
    [login, logout, register, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
