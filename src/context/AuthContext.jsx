import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut,
  updateProfile
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  getDocs, 
  onSnapshot 
} from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  // Sync or create user profile in Firestore
  const syncUserProfile = async (user) => {
    if (!user) {
      setUserProfile(null);
      return;
    }

    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        setUserProfile(userSnap.data());
      } else {
        // Check if this is the very first user in the database
        let isFirstUser = false;
        try {
          const usersSnap = await getDocs(collection(db, 'users'));
          isFirstUser = usersSnap.empty;
        } catch (e) {
          console.warn("First user check notice:", e);
          isFirstUser = true; // Default to admin if first document
        }

        const assignedRole = isFirstUser ? 'admin' : 'user';

        const newProfile = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || (user.email ? user.email.split('@')[0] : 'User'),
          photoURL: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
          role: assignedRole,
          createdAt: new Date().toISOString()
        };

        await setDoc(userRef, newProfile, { merge: true });
        setUserProfile(newProfile);
      }
    } catch (error) {
      console.error("Error syncing user profile:", error);
      setUserProfile({
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || 'User',
        role: 'user'
      });
    }
  };

  // Listen for Auth changes and Firestore role updates
  useEffect(() => {
    let unsubscribeProfile = () => {};

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await syncUserProfile(user);

        // Set up real-time listener for profile changes (e.g. role promotions)
        const userRef = doc(db, 'users', user.uid);
        unsubscribeProfile = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            setUserProfile(docSnap.data());
          }
        }, (err) => console.warn("Profile snapshot listener:", err));

      } else {
        setUserProfile(null);
      }
      setInitialLoading(false);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeProfile();
    };
  }, []);

  // Auth Methods
  const signUpWithEmail = async (email, password, displayName) => {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName && res.user) {
      await updateProfile(res.user, { displayName });
    }
    await syncUserProfile(res.user);
    return res;
  };

  const loginWithEmail = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const loginWithGoogle = async () => {
    const res = await signInWithPopup(auth, googleProvider);
    await syncUserProfile(res.user);
    return res;
  };

  const logout = () => {
    return signOut(auth);
  };

  const value = {
    currentUser,
    userProfile,
    isAdmin: userProfile?.role === 'admin',
    initialLoading,
    signUpWithEmail,
    loginWithEmail,
    loginWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!initialLoading ? children : (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-cyan-400 font-semibold text-sm">
          Loading Portfolio App...
        </div>
      )}
    </AuthContext.Provider>
  );
};
