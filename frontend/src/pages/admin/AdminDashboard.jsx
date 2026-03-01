import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/useAuth";
import {
  getAllUsers,
  updateUserBlockStatus,
  adminGetAllPosts,
  deletePostByAdmin,
} from "../../services/adminService";

export default function AdminDashboard() {
  const { profile } = useAuth();

  const [activeTab, setActiveTab] = useState("users"); // "users" | "posts"

  // USERS state
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState("");

  // POSTS state
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsError, setPostsError] = useState("");

  // --- load users (initial + on search submit) ---
  const loadUsers = async (term = "") => {
    setUsersLoading(true);
    setUsersError("");
    try {
      const data = await getAllUsers(term);
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setUsersError(err.message || "Failed to load users.");
    } finally {
      setUsersLoading(false);
    }
  };

  // --- load posts (when switching to posts tab) ---
  const loadPosts = async () => {
    setPostsLoading(true);
    setPostsError("");
    try {
      const data = await adminGetAllPosts();
      setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      setPostsError(err.message || "Failed to load posts.");
    } finally {
      setPostsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeTab === "posts") {
      loadPosts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const onUserSearchSubmit = (e) => {
    e.preventDefault();
    loadUsers(searchTerm);
  };

  const toggleBlock = async (u) => {
    setUsersError("");
    try {
      await updateUserBlockStatus(u.id, !u.is_blocked);
      setUsers((prev) =>
        prev.map((x) => (x.id === u.id ? { ...x, is_blocked: !u.is_blocked } : x))
      );
    } catch (err) {
      setUsersError(err.message || "Failed to update block status.");
    }
  };

  const onDeletePost = async (postId) => {
    setPostsError("");
    const ok = window.confirm("Delete this post?");
    if (!ok) return;

    try {
      await deletePostByAdmin(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (err) {
      setPostsError(err.message || "Failed to delete post.");
    }
  };

  const tabBtnStyle = (isActive) => ({
    padding: "8px 12px",
    border: "1px solid #ccc",
    background: isActive ? "#eee" : "#fff",
    cursor: "pointer",
    borderRadius: 6,
  });

  const headerRow = useMemo(() => {
    return (
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <h1 style={{ margin: 0 }}>Admin Dashboard</h1>
        <span style={{ opacity: 0.8 }}>
          Logged as: <strong>{profile?.username}</strong>
        </span>
      </div>
    );
  }, [profile?.username]);

  return (
    <div style={{ padding: 16 }}>
      {headerRow}

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button
          style={tabBtnStyle(activeTab === "users")}
          onClick={() => setActiveTab("users")}
        >
          Users
        </button>

        <button
          style={tabBtnStyle(activeTab === "posts")}
          onClick={() => setActiveTab("posts")}
        >
          Posts
        </button>
      </div>

      {/* USERS TAB */}
      {activeTab === "users" && (
        <div style={{ marginTop: 16 }}>
          <form onSubmit={onUserSearchSubmit} style={{ display: "flex", gap: 8 }}>
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search username / first / last..."
              style={{ flex: 1, padding: 8 }}
            />
            <button type="submit" disabled={usersLoading}>
              {usersLoading ? "Searching..." : "Search"}
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                loadUsers("");
              }}
              disabled={usersLoading}
            >
              Reset
            </button>
          </form>

          {usersLoading && <p>Loading users...</p>}
          {usersError && <p style={{ color: "red" }}>{usersError}</p>}

          {!usersLoading && !usersError && (
            <table
              border="1"
              cellPadding="8"
              style={{ borderCollapse: "collapse", width: "100%", marginTop: 12 }}
            >
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Blocked</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.username}</td>
                    <td>
                      {u.first_name} {u.last_name}
                    </td>
                    <td>{u.role}</td>
                    <td>{u.is_blocked ? "YES" : "NO"}</td>
                    <td>
                      <button
                        onClick={() => toggleBlock(u)}
                        disabled={u.id === profile?.id}
                        title={u.id === profile?.id ? "Can't block yourself" : ""}
                      >
                        {u.is_blocked ? "Unblock" : "Block"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* POSTS TAB */}
      {activeTab === "posts" && (
        <div style={{ marginTop: 16 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button onClick={loadPosts} disabled={postsLoading}>
              {postsLoading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {postsLoading && <p>Loading posts...</p>}
          {postsError && <p style={{ color: "red" }}>{postsError}</p>}

          {!postsLoading && !postsError && (
            <table
              border="1"
              cellPadding="8"
              style={{ borderCollapse: "collapse", width: "100%", marginTop: 12 }}
            >
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author ID</th>
                  <th>Created</th>
                  <th>Tags</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {posts.map((p) => (
                  <tr key={p.id}>
                    <td>{p.title}</td>
                    <td style={{ fontFamily: "monospace" }}>{p.author_id}</td>
                    <td>{new Date(p.created_at).toLocaleString()}</td>
                    <td>{p.tags || "-"}</td>
                    <td>
                      <button onClick={() => onDeletePost(p.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}