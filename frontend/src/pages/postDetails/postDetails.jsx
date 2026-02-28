import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchPostById } from "../../services/postServiceSupabase";

function PostDetails() {
  const { postId } = useParams();
  const [post, setPost] = useState(null);

  useEffect(() => {
    const loadPost = async () => {
      const data = await fetchPostById(postId);
      setPost(data);
    };

    loadPost();
  }, [postId]);

  if (!post) return <p>Post not found</p>;

  return (
    <div>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </div>
  );
}

export default PostDetails;