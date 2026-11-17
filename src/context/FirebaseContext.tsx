import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
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
  handleFirestoreError,
  OperationType,
} from '../firebase';
import { Language } from '../types';

export const BOOTSTRAPPED_ADMIN_EMAIL = 'rcgroup.mdp@gmail.com';

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
  clearAuthError: () => void;
  signInWithGoogle: () => Promise<User | null>;
  signOutUser: () => Promise<void>;
  updateUserPreferences: (lang: Language, theme: 'light' | 'dark') => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextValue | undefined>(undefined);

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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser) {
        setIsAdmin(false);
        setProfile(null);
        setAuthReady(true);
        return;
      }

      try {
        const adminRole = Boolean(
          firebaseUser.emailVerified &&
            firebaseUser.email?.toLowerCase() === BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase()
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

  const signOutUser = async (): Promise<void> => {
    setAuthLoading(true);
    try {
      await signOut(auth);
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
        clearAuthError: () => setAuthError(null),
        signInWithGoogle,
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
