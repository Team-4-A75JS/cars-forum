import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

export default function RequireAuth({ children }) {
  const { isAuthed, authLoading } = useAuth();

  if (authLoading) return <p>Loading...</p>;
  if (!isAuthed) return <Navigate to="/login" replace />;

  return children;
}
