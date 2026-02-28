import { Link } from "react-router-dom";
import { logoutUser } from "../../services/authService";
import { useAuth } from "../../context/useAuth";
import "./Navigation.css";

function Navigation() {
  const { isAuthed, isAdmin } = useAuth();

  const handleLogout = async () => {
    await logoutUser();
  };

  return (
    <nav className="nav">
      <ul className="nav-list">
        <li>
          <Link to="/">Home</Link>
        </li>

        {!isAuthed && (
          <>
            <li>
              <Link to="/login">Login</Link>
            </li>
            <li>
              <Link to="/register">Register</Link>
            </li>
          </>
        )}

        {isAuthed && isAdmin && (
          <li>
            <Link to="/admin">Admin</Link>
          </li>
        )}

        {isAuthed && (
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