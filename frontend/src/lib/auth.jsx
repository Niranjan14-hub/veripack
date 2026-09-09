import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, tokenStore, UNAUTHORIZED_EVENT } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!tokenStore.read()) {
      setReady(true);
      return;
    }
    let stale = false;
    api
      .me()
      .then((profile) => {
        if (!stale) setUser(profile);
      })
      .catch(() => {
        tokenStore.clear();
      })
      .finally(() => {
        if (!stale) setReady(true);
      });
    return () => {
      stale = true;
    };
  }, []);

  useEffect(() => {
    const onUnauthorized = () => setUser(null);
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  }, []);

  const adopt = useCallback((session) => {
    tokenStore.write(session.token);
    setUser(session.user);
  }, []);

  const value = useMemo(
    () => ({
      user,
      ready,
      login: async (credentials) => adopt(await api.login(credentials)),
      signup: async (details) => adopt(await api.signup(details)),
      logout: () => {
        tokenStore.clear();
        setUser(null);
      },
    }),
    [user, ready, adopt],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider.');
  return context;
}
