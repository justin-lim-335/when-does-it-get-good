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

  // Fetch username from public.users table
  const fetchUsername = async (userId: string) => {
    const { data, error } = await supabase
      .from("users")
      .select("username")
      .eq("auth_id", userId)
      .single();

    if (error) {
      console.error("Failed to fetch username:", error.message);
      setUsername(null);
    } else {
      setUsername(data?.username || null);
    }
  };

  // Listen for auth state changes and fetch username
  useEffect(() => {
    const getCurrentUser = async () => {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (currentUser) {
        setUser(currentUser);
        fetchUsername(currentUser.id);
      }
    };

    getCurrentUser();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const u = session?.user || null;
        setUser(u);
        if (u) fetchUsername(u.id);
        else setUsername(null);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, username, setUser, setUsername }}>
      {children}
    </AuthContext.Provider>
  );
};
