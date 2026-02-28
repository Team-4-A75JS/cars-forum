import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  getPostById,
  likePost,
  userLikedPost,
  getCommentsByPostId,
  addComment,
} from "../../services/postService";
import CommentList from "../../components/CommentList/CommentList.jsx";
import AddCommentForm from "../../components/AddCommentForm/AddCommentForm.jsx";

function PostDetails() {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentError, setCommentError] = useState("");

  useEffect(() => {
    const loadPost = async () => {
      const data = await getPostById(postId);
      if (data) {
        setPost(data);
        setLikes(data.likes ?? 0);
      }
    };

    const loadComments = async () => {
      setCommentLoading(true);
      try {
        const cdata = await getCommentsByPostId(postId);
        setComments(cdata);
      } finally {
        setCommentLoading(false);
      }
    };

    loadPost();
    loadComments();

    const checkLiked = async () => {
      try {
        const likedState = await userLikedPost(postId);
        setLiked(likedState);
      } catch (err) {
        console.error(err);
      }
    };

    checkLiked();
  }, [postId]);

  if (!post) return <p>Post not found</p>;

  const handleLike = async () => {
    try {
      const result = await likePost(postId);
      setLiked(result.liked);
      setLikes(result.likes);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async (text) => {
    setCommentError("");
    try {
      await addComment(postId, text);
      const cdata = await getCommentsByPostId(postId);
      setComments(cdata);
    } catch (err) {
      console.error(err);
      setCommentError(err.message || "Failed to add comment.");
    }
  };

  return (
    <div style={{ maxWidth: "800px", margin: "20px auto" }}>
      <h1>{post.title}</h1>
      {post.tags && post.tags.trim().length > 0 && (
        <div style={{ backgroundColor: "#f0f0f0", padding: "8px 12px", borderRadius: "4px", marginBottom: "15px", fontSize: "14px" }}>
          <strong>Tags:</strong> {post.tags}
        </div>
      )}
      <p><strong>Author:</strong> {post.author}</p>
      <div style={{ lineHeight: "1.6", marginBottom: "20px", whiteSpace: "pre-wrap" }}>
        {post.content}
      </div>

      <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px solid #ccc" }}>
        <button onClick={handleLike} style={{ padding: "8px 16px", marginRight: "10px", cursor: "pointer" }}>
          {liked ? "Unlike" : "Like"}
        </button>
        <span style={{ marginLeft: "10px" }}>{likes} likes</span>
      </div>

      <div style={{ marginTop: "40px", paddingTop: "20px", borderTop: "1px solid #ccc" }}>
        <h2>Comments</h2>
        {commentError && <p style={{ color: "red" }}>{commentError}</p>}
        <AddCommentForm onAddComment={handleAddComment} isSubmitting={commentLoading} />
        <CommentList comments={comments} />
      </div>
    </div>
  );
}

export default PostDetails;