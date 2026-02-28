import { useEffect, useState } from "react";
import { fetchPosts } from "../../services/postServiceSupabase";
import PostList from "../../components/PostList/PostList";

function Home() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const loadPosts = async () => {
      const data = await fetchPosts();
      setPosts(data);
    };

    loadPosts();
  }, []);

  return (
    <div className="home-container">
      <h1>Latest Posts</h1>
      <PostList posts={posts} />
    </div>
  );
}

export default Home;