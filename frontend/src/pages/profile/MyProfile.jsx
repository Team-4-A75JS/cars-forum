import { useEffect, useState } from "react";
import { useAuth } from "../../context/useAuth";
import { getMyProfile, updateMyProfile } from "../../services/profileService";
import { buildProfileStats, getBadgesForProfile } from "../../utils/reputation";

export default function MyProfile() {
  const { profile, authLoading } = useAuth();
  const [profileDetails, setProfileDetails] = useState(null);

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

  useEffect(() => {
    const loadProfile = async () => {
      if (!profile) return;

      try {
        const freshProfile = await getMyProfile();
        setProfileDetails(freshProfile);
      } catch {
        setProfileDetails(profile);
      }
    };

    loadProfile();
  }, [profile]);

  if (authLoading) return <p>Loading...</p>;
  if (!profile) return <p>No profile loaded.</p>;

  const visibleProfile = profileDetails ?? profile;
  const stats = buildProfileStats(visibleProfile);
  const badges = getBadgesForProfile(visibleProfile);

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
      const updatedProfile = await updateMyProfile(form);
      setProfileDetails(updatedProfile);
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
        <strong>Role:</strong> {visibleProfile.role}
      </p>
      <p>
        <strong>Blocked:</strong> {visibleProfile.is_blocked ? "YES" : "NO"}
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 12,
          marginBottom: 20,
          maxWidth: 720,
        }}
      >
        <div className="profile-stat-card">
          <strong>Reputation</strong>
          <div>{stats.reputation}</div>
        </div>
        <div className="profile-stat-card">
          <strong>Posts</strong>
          <div>{stats.postsCount}</div>
        </div>
        <div className="profile-stat-card">
          <strong>Comments</strong>
          <div>{stats.commentsCount}</div>
        </div>
        <div className="profile-stat-card">
          <strong>Member for</strong>
          <div>{stats.memberDays} days</div>
        </div>
      </div>

      <div style={{ marginBottom: 24, maxWidth: 720 }}>
        <h2>Badges</h2>
        {badges.length === 0 ? (
          <p>No badges yet. Start posting and getting votes.</p>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {badges.map((badge) => (
              <div key={badge.id} className={`badge-card badge-${badge.color}`}>
                <strong>{badge.label}</strong>
                <div>{badge.description}</div>
              </div>
            ))}
          </div>
        )}
      </div>

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
