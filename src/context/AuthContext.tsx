import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { supabase } from "../lib/supabaseClient";

interface AuthContextType {
  user: any | null;
  username: string | null;
  loading: boolean;
  setUser: (u: any) => void;
  setUsername: (name: string | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  username: null,
  loading: true,
  setUser: () => {},
  setUsername: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 👇 Fetch user on mount
    const initUser = async () => {
      const {
        data: { user: sessionUser },
      } = await supabase.auth.getUser();

      if (sessionUser) {
        setUser(sessionUser);
        await fetchUsername(sessionUser.id);
      }
      setLoading(false);
    };

    initUser();

    // 👇 Listen for auth changes (login/logout/signup)
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const u = session?.user || null;
        setUser(u);

        if (u) {
          await fetchUsername(u.id);
        } else {
          setUsername(null);
        }
      }
    );

    return () => {
      listener?.subscription?.unsubscribe?.();
    };
  }, []);

  // 👇 Helper: get username from public.users
  const fetchUsername = async (userId: string) => {
    const { data, error } = await supabase
      .from("users")
      .select("username")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Failed to fetch username:", error);
      setUsername(null);
    } else {
      setUsername(data?.username || null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        username,
        loading,
        setUser,
        setUsername,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};
