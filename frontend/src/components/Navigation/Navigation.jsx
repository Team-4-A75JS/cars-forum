import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../../config/supabase-config";
import "./Navigation.css";

function Navigation() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user ?? null);
    };

    loadUser();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <nav className="nav">
      <div className="nav-left" />
      <div className="nav-brand">
        <span className="nav-title">Car Forum</span>
      </div>
      <ul className="nav-list">
        <li>
          <Link to="/">Home</Link>
        </li>

        {user && (
          <li>
            <Link to="/create">Create Post</Link>
          </li>
        )}

        {!user && (
          <>
            <li>
              <Link to="/login">Login</Link>
            </li>
            <li>
              <Link to="/register">Register</Link>
            </li>
          </>
        )}

        {user && (
          <li>
            <button onClick={handleLogout}>Logout</button>
          </li>
        )}
      </ul>
    </nav>
  );
}

export default Navigation;