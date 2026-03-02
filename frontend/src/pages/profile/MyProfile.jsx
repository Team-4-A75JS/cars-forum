import { useEffect, useState } from "react";
import { supabase } from "../../config/supabase-config";
import { useAuth } from "../../context/useAuth";
import { updateMyProfile } from "../../services/profileService";
import { buildProfileStats, getBadgesForProfile } from "../../utils/reputation";

export default function MyProfile() {
  const { profile, authLoading, refreshProfile } = useAuth();
  const [profileDetails, setProfileDetails] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const [form, setForm] = useState({
    username: "",
    first_name: "",
    last_name: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  async function uploadAvatar(file) {
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr) throw userErr;
    const user = userData?.user;
    if (!user) throw new Error("You must be logged in.");

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${user.id}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, {
        cacheControl: "3600",
        upsert: true,
        contentType: file.type,
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    return data.publicUrl;
  }

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
      let avatarUrl = visibleProfile?.avatar_url ?? null;
      if (avatarFile) {
        setAvatarUploading(true);
        try {
          avatarUrl = await uploadAvatar(avatarFile);
        } finally {
          setAvatarUploading(false);
        }
      }

      const updatedProfile = await updateMyProfile({
        ...form,
        avatar_url: avatarUrl,
      });
      setProfileDetails(updatedProfile);
      await refreshProfile();
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
        <div className="form-group">
          <label htmlFor="username">User name:</label>
          <input
            id="username"
            name="username"
            value={form.username}
            onChange={onChange}
            minLength={3}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="first_name">First name:</label>
          <input
            id="first_name"
            name="first_name"
            value={form.first_name}
            onChange={onChange}
            minLength={4}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="last_name">Last name:</label>
          <input
            id="last_name"
            name="last_name"
            value={form.last_name}
            onChange={onChange}
            minLength={4}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="avatar">Profile picture:</label>
          <input
            id="avatar"
            type="file"
            accept="image/*"
            onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)}
          />
        </div>

        <button type="submit" disabled={loading || avatarUploading}>
          {avatarUploading
            ? "Uploading..."
            : loading
              ? "Saving..."
              : "Save changes"}
        </button>

        {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
        {successMsg && <p style={{ color: "green" }}>{successMsg}</p>}
      </form>
    </div>
  );
}
