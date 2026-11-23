import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  sendEmailVerification,
  signInWithPopup,
  signOut,
  User,
} from 'firebase/auth';
import {
  changeServerAdminPassword,
  fetchServerAuthStatus,
  loginServerAdmin,
  logoutServerAdmin,
  setupServerAdminPassword,
} from '../lib/adminApi';
import { auth, googleProvider } from '../lib/firebase';
import { clearWorkspaceAccessToken } from '../lib/googleWorkspace';
import {
  isAuthorizedAdminEmail,
  normalizeAdminEmailInput,
  validateAdminPasswordStrength,
} from '../utils/passwordCrypto';

interface AdminAuthContextValue {
  authReady: boolean;
  user: User | null;
  isFirebaseAdmin: boolean;
  needsEmailVerification: boolean;
  unauthorizedEmail: string | null;
  authStatusLoading: boolean;
  serverPasswordConfigured: boolean;
  envPasscodeActive: boolean;
  serverAdminEmail: string | null;
  isFullyAuthenticatedAdmin: boolean;
  signInWithGoogle: () => Promise<void>;
  sendAdminVerificationEmail: () => Promise<void>;
  refreshFirebaseUser: () => Promise<void>;
  refreshServerAuthStatus: () => Promise<void>;
  setupServerPassword: (email: string, password: string) => Promise<void>;
  signInWithServerPassword: (email: string, password: string) => Promise<void>;
  changeServerPassword: (currentPassword: string, newPassword: string) => Promise<void>;
  signOutAdmin: () => Promise<void>;
  getFirebaseIdToken: () => Promise<string | null>;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authReady, setAuthReady] = useState(false);
  const [user, setUser] = useState<User | null>(auth.currentUser);

  // Server passcode session (kept strictly in React memory, never web storage)
  const [authStatusLoading, setAuthStatusLoading] = useState(true);
  const [serverPasswordConfigured, setServerPasswordConfigured] = useState(false);
  const [envPasscodeActive, setEnvPasscodeActive] = useState(false);
  const [serverToken, setServerToken] = useState<string | null>(null);
  const [serverAdminEmail, setServerAdminEmail] = useState<string | null>(null);

  const isFirebaseAdmin = Boolean(
    user && isAuthorizedAdminEmail(user.email) && user.emailVerified === true
  );
  const needsEmailVerification = Boolean(
    user && isAuthorizedAdminEmail(user.email) && user.emailVerified !== true
  );
  const unauthorizedEmail =
    user && !isAuthorizedAdminEmail(user.email) ? user.email || 'unknown' : null;

  const refreshServerAuthStatus = useCallback(async () => {
    setAuthStatusLoading(true);
    try {
      const status = await fetchServerAuthStatus();
      setServerPasswordConfigured(Boolean(status.configured));
      setEnvPasscodeActive(Boolean(status.envPasscodeActive));
    } catch {
      // Keep prior state on transient network failure
    } finally {
      setAuthStatusLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshServerAuthStatus();
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, [refreshServerAuthStatus]);

  const signInWithGoogle = useCallback(async () => {
    await signInWithPopup(auth, googleProvider);
  }, []);

  const sendAdminVerificationEmail = useCallback(async () => {
    if (!auth.currentUser) {
      throw new Error('No signed-in Firebase user.');
    }
    await sendEmailVerification(auth.currentUser);
  }, []);

  const refreshFirebaseUser = useCallback(async () => {
    if (!auth.currentUser) return;
    await auth.currentUser.reload();
    const refreshed = auth.currentUser;
    setUser(refreshed ? ({ ...refreshed } as User) : null);
  }, []);

  const setupServerPassword = useCallback(async (email: string, password: string) => {
    const normalized = normalizeAdminEmailInput(email);
    if (!isAuthorizedAdminEmail(normalized)) {
      const err = new Error('This email address is not authorized for Protec Admin access.');
      (err as Error & { code?: string }).code = 'protec/unauthorized-email';
      throw err;
    }
    const strength = validateAdminPasswordStrength(password);
    if (!strength.valid) {
      const err = new Error('Password must be between 8 and 128 characters.');
      (err as Error & { code?: string }).code = 'protec/weak-password';
      throw err;
    }
    const res = await setupServerAdminPassword(normalized, password);
    setServerToken(res.token);
    setServerAdminEmail(res.email);
    setServerPasswordConfigured(true);
  }, []);

  const signInWithServerPassword = useCallback(async (email: string, password: string) => {
    const normalized = normalizeAdminEmailInput(email);
    if (!isAuthorizedAdminEmail(normalized)) {
      const err = new Error('This email address is not authorized for Protec Admin access.');
      (err as Error & { code?: string }).code = 'protec/unauthorized-email';
      throw err;
    }
    const res = await loginServerAdmin(normalized, password);
    setServerToken(res.token);
    setServerAdminEmail(res.email);
    setServerPasswordConfigured(true);
  }, []);

  const getFirebaseIdToken = useCallback(async (): Promise<string | null> => {
    if (auth.currentUser && isFirebaseAdmin) {
      return auth.currentUser.getIdToken();
    }
    return serverToken;
  }, [isFirebaseAdmin, serverToken]);

  const changeServerPassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      const token = await getFirebaseIdToken();
      if (!token) {
        throw new Error('Active authenticated admin session required.');
      }
      const strength = validateAdminPasswordStrength(newPassword);
      if (!strength.valid) {
        throw new Error('New password must be between 8 and 128 characters.');
      }
      await changeServerAdminPassword(token, currentPassword, newPassword);
    },
    [getFirebaseIdToken]
  );

  const signOutAdmin = useCallback(async () => {
    const tokenToRevoke = serverToken;
    setServerToken(null);
    setServerAdminEmail(null);
    clearWorkspaceAccessToken();
    if (tokenToRevoke) {
      await logoutServerAdmin(tokenToRevoke);
    }
    if (auth.currentUser) {
      await signOut(auth);
    }
  }, [serverToken]);

  const isFullyAuthenticatedAdmin = authReady && (isFirebaseAdmin || Boolean(serverToken));

  return (
    <AdminAuthContext.Provider
      value={{
        authReady,
        user,
        isFirebaseAdmin,
        needsEmailVerification,
        unauthorizedEmail,
        authStatusLoading,
        serverPasswordConfigured,
        envPasscodeActive,
        serverAdminEmail,
        isFullyAuthenticatedAdmin,
        signInWithGoogle,
        sendAdminVerificationEmail,
        refreshFirebaseUser,
        refreshServerAuthStatus,
        setupServerPassword,
        signInWithServerPassword,
        changeServerPassword,
        signOutAdmin,
        getFirebaseIdToken,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export function useAdminAuth(): AdminAuthContextValue {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error('useAdminAuth must be used inside AdminAuthProvider');
  }
  return ctx;
}
