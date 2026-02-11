import "./Home.css"
import PostItem from "../../components/PostItem/PostItem.jsx";
import { getAllPosts } from "../../services/postService.js";
import PostList from "../../components/PostList/PostList.jsx";
import { useState } from "react";

function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const posts = getAllPosts();

  let filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (sortBy === 'likes') {
    filteredPosts.sort((a, b) => b.likes - a.likes)
  } else if (sortBy === 'newest') {
    filteredPosts.sort((a, b) => b.id - a.id)
  }

  return (
    <div className="home-container">
      <h1>Latest Posts</h1>

      <div className="controls">
        <input
          type="text"
          placeholder="Search by title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="newest">Newest</option>
          <option value="likes">Most liked</option>
        </select>
      </div>

      <PostList posts={filteredPosts} />
    </div>
  );


}

export default Home;
