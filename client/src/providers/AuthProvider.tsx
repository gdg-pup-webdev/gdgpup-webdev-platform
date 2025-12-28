"use client";

import { auth, googleProvider } from "@/lib/firebase/firebase";
import { deleteCookie, getCookie, setCookie } from "cookies-next";
import { GoogleAuthProvider, signInWithPopup, User } from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";

// 1. Define a strictly typed State Object to prevent invalid combos
type AuthState = {
  user: User | null;
  token: string | null;
  role: string | null;
  googleAccessToken: string | null;
  status: "checking" | "unauthenticated" | "authenticated";
  error: string | null;
};

// 2. Define the Context Method types separate from the State
type AuthContextActions = {
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
};

// Combine them for the final context type
type AuthContextType = AuthState & AuthContextActions;

// Default initial state
const initialState: AuthState = {
  user: null,
  token: null,
  role: null,
  googleAccessToken: null,
  status: "checking",
  error: null,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // 3. Use a SINGLE state object for atomic updates
  const [authState, setAuthState] = useState<AuthState>(initialState);

  useEffect(() => {
    // onIdTokenChanged is better than onAuthStateChanged as it handles token refreshes
    const unsubscribe = auth.onIdTokenChanged(async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Force refresh to get the latest claims (role)
          const tokenResult = await firebaseUser.getIdTokenResult(); 
          const token = tokenResult.token;
          const role = (tokenResult.claims.role as string) || "guest";

          // Retrieve Google Token from storage (since Firebase doesn't persist it)
          // NOTE: getCookie can return undefined, strict check helps
          const storedAccessToken = getCookie("googleAccessToken");
          const googleToken = typeof storedAccessToken === 'string' ? storedAccessToken : null;

          // 4. ATOMIC UPDATE: User, Role, and Status update together
          setAuthState({
            user: firebaseUser,
            token,
            role,
            googleAccessToken: googleToken,
            status: "authenticated",
            error: null,
          });
        } else {
          // User is logged out
          setAuthState({
            ...initialState,
            status: "unauthenticated",
          });
        }
      } catch (err) {
        console.error("Auth State Change Error:", err);
        setAuthState({
          ...initialState,
          status: "unauthenticated",
          error: "Failed to restore authentication state",
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      // Set loading state or clear errors before starting
      setAuthState((prev) => ({ ...prev, error: null }));

      const result = await signInWithPopup(auth, googleProvider);
      
      // Extract Google Access Token (Only available immediately after login)
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const googleAccessToken = credential?.accessToken || null;

      if (googleAccessToken) {
        // SECURITY NOTE: 'lax' or 'strict' is crucial. 
        // Ideally, do this via a Server Action to set an HTTPOnly cookie.
        setCookie("googleAccessToken", googleAccessToken, {
          maxAge: 60 * 60, // Google tokens usually expire in 1 hour
          secure: true, // Only send over HTTPS
          sameSite: "strict", // Protect against CSRF
        });
      }

      // We do NOT need to manually setAuthState here. 
      // The onIdTokenChanged listener will fire automatically 
      // when signInWithPopup succeeds, handling the state update for us.
      
    } catch (error: any) {
      console.error(error);
      setAuthState((prev) => ({
        ...prev,
        error: error.message || "Failed to login with Google",
      }));
    }
  };

  const logout = async () => {
    try {
      await auth.signOut();
      deleteCookie("googleAccessToken");
      // Again, no need to manually set state; the listener will handle it.
    } catch (err: any) {
      setAuthState((prev) => ({
        ...prev,
        error: "Failed to logout",
      }));
    }
  };

  return (
    <AuthContext.Provider value={{ ...authState, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};