import { useEffect, useState } from "react";
import { getAllPosts } from "../../services/postService";
import PostList from "../../components/PostList/PostList";

function Home() {
  const [posts, setPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getAllPosts();
        console.log("Loaded posts:", data);
        setPosts(data);
      } catch (err) {
        console.error("Error loading posts:", err);
        setError(`Failed to load posts: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, []);

  const uniqueCategories = [
    "All",
    ...Array.from(
      new Set(
        posts
          .filter(p => p.tags && p.tags.trim().length > 0)
          .flatMap((p) =>
            p.tags
              .split(",")
              .map((t) => t.trim())
              .filter((t) => t && t.length > 0)
          )
      )
    ),
  ];

  console.log("Available categories:", uniqueCategories);

  const filteredPosts = posts.filter((post) => {
    const matchesSearch = post.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const tagsArray = (post.tags || "")
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t);
    const matchesCategory =
      category === "All" || tagsArray.includes(category.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="home-container">
      <h1>Latest Posts</h1>

      {error && (
        <div style={{ color: "red", marginBottom: "10px", padding: "10px", backgroundColor: "#ffe6e6", borderRadius: "4px" }}>
          {error}
        </div>
      )}

      {loading ? (
        <p>Loading posts...</p>
      ) : posts.length === 0 ? (
        <p>No posts found. Be the first to create one!</p>
      ) : (
        <>
          <div className="search-wrapper" style={{ textAlign: "center", marginBottom: "20px" }}>
            <input
              type="text"
              placeholder="Search posts by title..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "60%",
                maxWidth: "300px",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ccc",
                marginRight: "10px",
              }}
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            >
              {uniqueCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <PostList posts={filteredPosts} />
        </>
      )}
    </div>
  );
}

export default Home;