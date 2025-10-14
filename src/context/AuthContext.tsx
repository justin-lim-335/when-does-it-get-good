// src/context/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { supabase } from "../lib/supabaseClient";

interface AuthContextType {
  user: any | null;
  username: string | null;
  setUser: (u: any) => void;
  setUsername: (name: string | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  username: null,
  setUser: () => {},
  setUsername: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      const {
        data: { user: sessionUser },
      } = await supabase.auth.getUser();

      if (sessionUser) {
        setUser(sessionUser);
        const name = sessionUser.user_metadata?.username || null;
        setUsername(name);
      }
    };
    getCurrentUser();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const u = session?.user || null;
        setUser(u);
        const name = u?.user_metadata?.username || null;
        setUsername(name);
      }
    );

    return () => listener?.subscription?.unsubscribe?.();
  }, []);

  return (
    <AuthContext.Provider value={{ user, username, setUser, setUsername }}>
      {children}
    </AuthContext.Provider>
  );
};
