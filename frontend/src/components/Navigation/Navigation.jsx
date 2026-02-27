import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../../config/supabase-config";
import { logoutUser, getSession } from "../../services/authService";
import "./Navigation.css";

function Navigation() {
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession();
      setHasSession(Boolean(session));
    };
    checkSession();

    const { data } = supabase.auth.onAuthStateChange(() => {
      checkSession();
    });

    return () => {
      data?.subscription?.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    setHasSession(false);
  };

  return (
    <nav className="nav">
      <ul className="nav-list">
        <li>
          <Link to="/">Home</Link>
        </li>

        {!hasSession && (
          <>
            <li>
              <Link to="/login">Login</Link>
            </li>
            <li>
              <Link to="/register">Register</Link>
            </li>
          </>
        )}

        {hasSession && (
          <>
            <li>
              <Link to="/create">Create Post</Link>
            </li>
            <li>
              <button onClick={handleLogout}>Logout</button>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navigation;