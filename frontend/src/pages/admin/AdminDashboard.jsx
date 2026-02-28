import { useAuth } from "../../context/useAuth";

export default function AdminDashboard() {
  const { profile } = useAuth();

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Welcome, {profile?.username}</p>
    </div>
  );
}
