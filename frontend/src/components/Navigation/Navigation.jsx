import { Link } from "react-router-dom";
import { logoutUser } from "../../services/authService";
import { useAuth } from "../../context/useAuth";
import { useNavigate } from "react-router-dom";
import "./Navigation.css";

function Navigation() {
  const { isAuthed, isAdmin } = useAuth();

  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
    navigate("/", { replace: true });
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
              <Link to="/profile">My Profile</Link>
            </li>
            <li>
              <Link to="/create">Create Post</Link>
            </li>
            <li>
              <Link to="/vin-check">VIN Check</Link>
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
