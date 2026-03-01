import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  getPostById,
  likePost,
  userLikedPost,
  getCommentsByPostId,
  addComment,
  deletePost,
  deleteComment,
} from "../../services/postService";
import CommentList from "../../components/CommentList/CommentList.jsx";
import AddCommentForm from "../../components/AddCommentForm/AddCommentForm.jsx";
import { getCurrentUserProfile } from "../../services/authService";
import "./PostDetails.css";

function PostDetails() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentError, setCommentError] = useState("");
  const [currentProfile, setCurrentProfile] = useState(null);

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

    // load current user profile for authorization
    const loadProfile = async () => {
      try {
        const profile = await getCurrentUserProfile();
        setCurrentProfile(profile);
      } catch (err) {
        console.error("Failed to load current profile:", err);
      }
    };
    loadProfile();
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
    <div className="post-details">
      <h1>{post.title}</h1>
      {post.tags && post.tags.trim().length > 0 && (
        <div className="post-details-tags">
          <strong>Tags:</strong> {post.tags}
        </div>
      )}
      <p className="post-details-author"><strong>Author:</strong> {post.author}</p>
      <div className="post-details-content">
        {post.content}
      </div>

      <div className="post-actions">
        <button className="like-btn" onClick={handleLike}>
          {liked ? "Unlike" : "Like"}
        </button>
        <span className="likes-count">{likes} likes</span>
        {currentProfile && (currentProfile.id === post.authorId || currentProfile.role === "admin") && (
          <button
            className="btn-delete"
            onClick={async () => {
              if (window.confirm("Delete this post?")) {
                await deletePost(post.id);
                navigate("/");
              }
            }}
          >
            Delete Post
          </button>
        )}
      </div>

      <div className="comments-section">
        <h2>Comments</h2>
        {commentError && <p className="comment-error">{commentError}</p>}
        <AddCommentForm onAddComment={handleAddComment} isSubmitting={commentLoading} />
        <CommentList
          comments={comments}
          currentProfile={currentProfile}
          onDeleteComment={async (commentId) => {
            if (window.confirm("Delete this comment?")) {
              await deleteComment(commentId);
              // refresh comments
              const comms = await getCommentsByPostId(postId);
              setComments(comms);
            }
          }}
        />
      </div>
    </div>
  );
}

export default PostDetails;