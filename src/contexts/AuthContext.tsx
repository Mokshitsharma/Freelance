import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { signInWithCustomToken, signOut, onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

interface UserProfile {
  uid: string;
  name?: string;
  phone?: string;
  email?: string;
  age?: number;
  profession?: string;
  native_place?: string;
  current_city?: string;
  family_details?: string;
  photo?: string;
  role: 'member' | 'admin';
  status?: 'active' | 'pending';
  created_at: string;
}

interface AuthContextType {
  currentUser: { uid: string; email?: string } | null;
  userProfile: UserProfile | null;
  loading: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<{ uid: string; phone?: string; email?: string } | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (uid: string) => {
    try {
      // Try admins collection
      const adminRef = doc(db, 'admins', uid);
      const adminSnap = await getDoc(adminRef);
      if (adminSnap.exists()) {
        setUserProfile({ uid, ...adminSnap.data() } as UserProfile);
        return;
      }

      // Fallback to users collection for existing members if needed, 
      // but primarily we care about admins for auth context now
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setUserProfile(userSnap.data() as UserProfile);
        return;
      }

      setUserProfile(null);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser({ 
          uid: user.uid, 
          email: user.email || undefined
        });
        await fetchProfile(user.uid);
      } else {
        setCurrentUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const loginWithEmail = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const refreshProfile = async () => {
    if (currentUser) {
      await fetchProfile(currentUser.uid);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const value = {
    currentUser,
    userProfile,
    loading,
    loginWithEmail,
    logout,
    refreshProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
