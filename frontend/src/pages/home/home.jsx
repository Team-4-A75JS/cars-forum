import "./Home.css";
import { getAllPosts } from "../../services/postService.js";
import PostList from "../../components/PostList/PostList.jsx";
import { useEffect, useMemo, useState } from "react";

function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadPosts = async () => {
      setLoading(true);
      setErrorMsg("");

      try {
        const data = await getAllPosts();
        console.log("✅ USING postService.js from src/services/postService.js");
        console.log("getAllPosts returned:", data);
        console.log("isArray?", Array.isArray(data));
        if (isMounted) {
          setPosts(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMsg(error.message || "Failed to load posts.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadPosts();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredPosts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const visiblePosts = posts.filter(
      (post) =>
        post.title.toLowerCase().includes(normalizedSearch) ||
        (post.tags ?? "").toLowerCase().includes(normalizedSearch),
    );

    const sortedPosts = [...visiblePosts];
    if (sortBy === "likes") {
      sortedPosts.sort((a, b) => b.likes - a.likes);
    } else {
      sortedPosts.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    }

    return sortedPosts;
  }, [posts, searchTerm, sortBy]);

  return (
    <div className="home-container">
      <h1>Latest Posts</h1>

      <div className="search-wrapper controls">
        <input
          type="text"
          className="search-input"
          placeholder="Search by title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="newest">Newest</option>
          <option value="likes">Most liked</option>
        </select>
      </div>

      {loading && <p className="loading-message">Loading posts...</p>}
      {errorMsg && <p className="error-banner">{errorMsg}</p>}
      {!loading && !errorMsg && filteredPosts.length === 0 && (
        <p className="no-posts-message">No posts yet.</p>
      )}


      <PostList posts={filteredPosts} />
    </div>
  );
}

export default Home;
