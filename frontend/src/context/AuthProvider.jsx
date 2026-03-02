import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../config/supabase-config";
import AuthContext from "./AuthContext";
import { getMyProfile } from "../services/profileService";

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    try {
      const p = await getMyProfile();
      setProfile(p);
    } catch {
      setProfile(null);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    const s = data?.session ?? null;

    setSession(s);

    if (s) {
      await loadProfile();
    } else {
      setProfile(null);
    }
  }, [loadProfile]);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data?.session ?? null);

      if (data?.session) {
        await loadProfile();
      } else {
        setProfile(null);
      }

      setAuthLoading(false);
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);

        if (newSession) {
          await loadProfile();
        } else {
          setProfile(null);
        }
      },
    );

    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({
      session,
      profile,
      authLoading,
      isAuthed: Boolean(session),
      isAdmin: profile?.role === "admin",
      isBlocked: Boolean(profile?.is_blocked),
      refreshProfile,
    }),
    [session, profile, authLoading, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
