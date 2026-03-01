import { useEffect, useState } from "react";
import { useAuth } from "../../context/useAuth";
import { updateMyProfile } from "../../services/profileService";

export default function MyProfile() {
  const { profile, authLoading } = useAuth();

  const [form, setForm] = useState({
    username: "",
    first_name: "",
    last_name: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (profile) {
      setForm({
        username: profile.username ?? "",
        first_name: profile.first_name ?? "",
        last_name: profile.last_name ?? "",
      });
    }
  }, [profile]);

  if (authLoading) return <p>Loading...</p>;
  if (!profile) return <p>No profile loaded.</p>;

  const onChange = (e) => {
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    // client-side validation (по условие first/last min 4)
    if (form.username.trim().length < 3) {
      setLoading(false);
      setErrorMsg("Username must be at least 3 characters.");
      return;
    }
    if (form.first_name.trim().length < 4) {
      setLoading(false);
      setErrorMsg("First name must be at least 4 characters.");
      return;
    }
    if (form.last_name.trim().length < 4) {
      setLoading(false);
      setErrorMsg("Last name must be at least 4 characters.");
      return;
    }

    try {
      await updateMyProfile(form);
      setSuccessMsg("Profile updated!");
    } catch (err) {
      setErrorMsg(err.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h1>My Profile</h1>

      <p>
        <strong>Role:</strong> {profile.role}
      </p>
      <p>
        <strong>Blocked:</strong> {profile.is_blocked ? "YES" : "NO"}
      </p>

      <form
        onSubmit={onSubmit}
        style={{ display: "grid", gap: 8, maxWidth: 420 }}
      >
        <input
          name="username"
          value={form.username}
          onChange={onChange}
          placeholder="Username"
          minLength={3}
          required
        />
        <input
          name="first_name"
          value={form.first_name}
          onChange={onChange}
          placeholder="First name"
          minLength={4}
          required
        />
        <input
          name="last_name"
          value={form.last_name}
          onChange={onChange}
          placeholder="Last name"
          minLength={4}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save changes"}
        </button>

        {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
        {successMsg && <p style={{ color: "green" }}>{successMsg}</p>}
      </form>
    </div>
  );
}
