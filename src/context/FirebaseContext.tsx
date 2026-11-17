import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import {
  auth,
  db,
  googleProvider,
  gmailGoogleProvider,
  handleFirestoreError,
  OperationType,
} from '../firebase';
import { Language } from '../types';

export const BOOTSTRAPPED_ADMIN_EMAIL = 'rcgroup.mdp@gmail.com';
export const BOOTSTRAPPED_ADMIN_EMAILS = [
  'rcgroup.mdp@gmail.com',
  'rcgroup.digitalmarketing@gmail.com',
] as const;

export function isBootstrappedAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalized = email.toLowerCase();
  return BOOTSTRAPPED_ADMIN_EMAILS.some((adminEmail) => adminEmail.toLowerCase() === normalized);
}

export interface UserProfileData {
  uid: string;
  displayName: string;
  photoURL?: string;
  preferredLanguage: Language;
  themePreference: 'light' | 'dark';
}

interface FirebaseContextValue {
  user: User | null;
  authReady: boolean;
  authLoading: boolean;
  isAdmin: boolean;
  profile: UserProfileData | null;
  authError: string | null;
  gmailAccessToken: string | null;
  gmailConnecting: boolean;
  gmailAuthError: string | null;
  clearAuthError: () => void;
  clearGmailAuthError: () => void;
  signInWithGoogle: () => Promise<User | null>;
  connectGmail: () => Promise<string | null>;
  disconnectGmailToken: () => void;
  signOutUser: () => Promise<void>;
  updateUserPreferences: (lang: Language, theme: 'light' | 'dark') => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextValue | undefined>(undefined);

// Strictly in-memory OAuth access token cache (never stored in localStorage or sessionStorage)
let cachedGmailAccessToken: string | null = null;
let isGmailSigningIn = false;

function clampStr(val: string | null | undefined, max: number, fallback = ''): string {
  const s = (val ?? fallback).trim();
  return s.length > max ? s.slice(0, max) : s;
}

export const FirebaseProvider: React.FC<{
  children: React.ReactNode;
  language: Language;
  isDark: boolean;
  onHydratePreferences?: (lang: Language, theme: 'light' | 'dark') => void;
}> = ({ children, language, isDark, onHydratePreferences }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [gmailAccessToken, setGmailAccessToken] = useState<string | null>(() => cachedGmailAccessToken);
  const [gmailConnecting, setGmailConnecting] = useState(false);
  const [gmailAuthError, setGmailAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser) {
        cachedGmailAccessToken = null;
        setGmailAccessToken(null);
        setIsAdmin(false);
        setProfile(null);
        setAuthReady(true);
        return;
      }
      if (!isGmailSigningIn && cachedGmailAccessToken) {
        setGmailAccessToken(cachedGmailAccessToken);
      }

      try {
        const adminRole = Boolean(
          firebaseUser.emailVerified && isBootstrappedAdminEmail(firebaseUser.email)
        );
        setIsAdmin(adminRole);

        if (firebaseUser.emailVerified) {
          const profilePath = `user_profiles/${firebaseUser.uid}`;
          const profileRef = doc(db, 'user_profiles', firebaseUser.uid);
          let existingProfile: UserProfileData | null = null;

          try {
            const snap = await getDoc(profileRef);
            if (snap.exists()) {
              const raw = snap.data();
              existingProfile = {
                uid: firebaseUser.uid,
                displayName: clampStr(raw.displayName, 120, firebaseUser.displayName || 'RCG User'),
                photoURL: typeof raw.photoURL === 'string' ? raw.photoURL : undefined,
                preferredLanguage: raw.preferredLanguage === 'en' ? 'en' : 'fa',
                themePreference: raw.themePreference === 'dark' ? 'dark' : 'light',
              };
            }
          } catch (error) {
            handleFirestoreError(error, OperationType.GET, profilePath);
          }

          if (existingProfile) {
            setProfile(existingProfile);
            if (onHydratePreferences) {
              onHydratePreferences(existingProfile.preferredLanguage, existingProfile.themePreference);
            }
          } else {
            const displayName = clampStr(
              firebaseUser.displayName || firebaseUser.email?.split('@')[0],
              120,
              'RCG User'
            );
            const photoURL = clampStr(firebaseUser.photoURL, 1000);
            const newProfilePayload: Record<string, unknown> = {
              uid: firebaseUser.uid,
              displayName,
              preferredLanguage: language,
              themePreference: isDark ? 'dark' : 'light',
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            };
            if (photoURL) {
              newProfilePayload.photoURL = photoURL;
            }

            try {
              await setDoc(profileRef, newProfilePayload);
            } catch (error) {
              handleFirestoreError(error, OperationType.CREATE, profilePath);
            }

            // Store PII (email) in strictly isolated private subcollection
            if (firebaseUser.email) {
              const privatePath = `user_profiles/${firebaseUser.uid}/private/pii`;
              try {
                await setDoc(doc(db, 'user_profiles', firebaseUser.uid, 'private', 'pii'), {
                  uid: firebaseUser.uid,
                  email: clampStr(firebaseUser.email, 200),
                  updatedAt: serverTimestamp(),
                });
              } catch (error) {
                handleFirestoreError(error, OperationType.CREATE, privatePath);
              }
            }

            setProfile({
              uid: firebaseUser.uid,
              displayName,
              photoURL: photoURL || undefined,
              preferredLanguage: language,
              themePreference: isDark ? 'dark' : 'light',
            });
          }
        }
      } catch (err) {
        console.error('Auth state initialization failed:', err);
      } finally {
        setAuthReady(true);
      }
    });

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signInWithGoogle = async (): Promise<User | null> => {
    setAuthError(null);
    setAuthLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Unable to complete Google sign-in';
      if (!msg.includes('popup-closed-by-user')) {
        setAuthError(msg);
      }
      return null;
    } finally {
      setAuthLoading(false);
    }
  };

  const connectGmail = async (): Promise<string | null> => {
    setGmailAuthError(null);
    setGmailConnecting(true);
    isGmailSigningIn = true;
    try {
      const result = await signInWithPopup(auth, gmailGoogleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken ?? null;
      if (!token) {
        throw new Error('Failed to retrieve Gmail OAuth access token from Google sign-in.');
      }
      cachedGmailAccessToken = token;
      setGmailAccessToken(token);
      return token;
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Unable to connect Gmail via Google Sign-In';
      if (!msg.includes('popup-closed-by-user')) {
        setGmailAuthError(msg);
      }
      return null;
    } finally {
      isGmailSigningIn = false;
      setGmailConnecting(false);
    }
  };

  const disconnectGmailToken = () => {
    cachedGmailAccessToken = null;
    setGmailAccessToken(null);
  };

  const signOutUser = async (): Promise<void> => {
    setAuthLoading(true);
    try {
      await signOut(auth);
      cachedGmailAccessToken = null;
      setGmailAccessToken(null);
      setProfile(null);
      setIsAdmin(false);
    } finally {
      setAuthLoading(false);
    }
  };

  const updateUserPreferences = async (
    preferredLanguage: Language,
    themePreference: 'light' | 'dark'
  ): Promise<void> => {
    if (!user || !user.emailVerified || !profile) return;
    const profilePath = `user_profiles/${user.uid}`;
    const displayName = clampStr(
      profile.displayName || user.displayName || 'RCG User',
      120,
      'RCG User'
    );
    try {
      await setDoc(
        doc(db, 'user_profiles', user.uid),
        {
          preferredLanguage,
          themePreference,
          displayName,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              preferredLanguage,
              themePreference,
            }
          : prev
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, profilePath);
    }
  };

  return (
    <FirebaseContext.Provider
      value={{
        user,
        authReady,
        authLoading,
        isAdmin,
        profile,
        authError,
        gmailAccessToken,
        gmailConnecting,
        gmailAuthError,
        clearAuthError: () => setAuthError(null),
        clearGmailAuthError: () => setGmailAuthError(null),
        signInWithGoogle,
        connectGmail,
        disconnectGmailToken,
        signOutUser,
        updateUserPreferences,
      }}
    >
      {children}
    </FirebaseContext.Provider>
  );
};

export function useFirebase(): FirebaseContextValue {
  const ctx = useContext(FirebaseContext);
  if (!ctx) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return ctx;
}
