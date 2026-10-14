import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider, signOut } from '../lib/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  loginWithGoogle: () => Promise<void>;
  loginAsAdminDirectly: () => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  // Do NOT show a fake profile when user is not logged in!
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrCreateProfile = async (firebaseUser: User) => {
    const userRef = doc(db, 'users', firebaseUser.uid);
    try {
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        setProfile(snap.data() as UserProfile);
      } else {
        const newProfile: UserProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || 'kunalqaz1@gmail.com',
          displayName: firebaseUser.displayName || (firebaseUser.email?.includes('kunal') ? 'Kunal Merchant' : 'Staff Member'),
          photoURL: firebaseUser.photoURL || undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await setDoc(userRef, newProfile);
        setProfile(newProfile);
      }
    } catch (err) {
      console.warn("Could not fetch user profile directly, using standard profile:", err);
      setProfile({
        uid: firebaseUser.uid,
        email: firebaseUser.email || 'kunalqaz1@gmail.com',
        displayName: firebaseUser.displayName || 'Kunal Merchant',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  };

  useEffect(() => {
    // Check if admin direct session was preserved
    const directSession = localStorage.getItem('anu_tools_admin_session');

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await fetchOrCreateProfile(currentUser);
      } else if (directSession === 'kunalqaz1@gmail.com') {
        setUser(null);
        setProfile({
          uid: 'merchant_kunal',
          email: 'kunalqaz1@gmail.com',
          displayName: 'Kunal Merchant (Admin)',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      } else {
        // Explicitly NOT logged in - profile is null!
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      const res = await signInWithPopup(auth, googleProvider);
      if (res.user) {
        localStorage.removeItem('anu_tools_admin_session');
        await fetchOrCreateProfile(res.user);
      }
    } catch (err: unknown) {
      console.error("Google sign in error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginAsAdminDirectly = async () => {
    setLoading(true);
    localStorage.setItem('anu_tools_admin_session', 'kunalqaz1@gmail.com');
    setProfile({
      uid: 'merchant_kunal',
      email: 'kunalqaz1@gmail.com',
      displayName: 'Kunal Merchant (Admin)',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setLoading(false);
  };

  const logout = async () => {
    try {
      localStorage.removeItem('anu_tools_admin_session');
      await signOut(auth);
    } catch (err) {
      console.error("Sign out error:", err);
    } finally {
      setUser(null);
      setProfile(null);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchOrCreateProfile(user);
    }
  };

  const currentEmail = (profile?.email || user?.email || '').toLowerCase();
  const isAdmin = currentEmail === 'kunalqaz1@gmail.com';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isAdmin,
        loginWithGoogle,
        loginAsAdminDirectly,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
