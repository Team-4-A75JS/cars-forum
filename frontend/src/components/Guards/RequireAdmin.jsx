import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

export default function RequireAdmin({ children }) {
  const { isAuthed, isAdmin, authLoading } = useAuth();

  if (authLoading) return <p>Loading...</p>;
  if (!isAuthed) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  return children;
}
