import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  downvotePost,
  getPostById,
  likePost,
  getUserPostVote,
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
  const [postLoading, setPostLoading] = useState(true);
  const [postError, setPostError] = useState("");
  const [likes, setLikes] = useState(0);
  const [vote, setVote] = useState(0);
  const [comments, setComments] = useState([]);
  const [commentLoading, setCommentLoading] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState("");
  const [currentProfile, setCurrentProfile] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadPage = async () => {
      setPostLoading(true);
      setCommentLoading(true);
      setPostError("");
      setCommentError("");

      try {
        const [postData, commentsData, profile] = await Promise.all([
          getPostById(postId),
          getCommentsByPostId(postId),
          getCurrentUserProfile().catch(() => null),
        ]);

        if (!isMounted) return;

        if (!postData) {
          setPost(null);
          setPostError("Post not found.");
          return;
        }

        setPost(postData);
        setLikes(postData.likes ?? 0);
        setComments(commentsData);
        setCurrentProfile(profile);

        if (profile) {
          try {
            const currentVote = await getUserPostVote(postId);
            if (isMounted) {
              setVote(currentVote);
            }
          } catch {
            if (isMounted) {
              setVote(0);
            }
          }
        } else {
          setVote(0);
        }
      } catch (error) {
        if (isMounted) {
          setPostError(error.message || "Failed to load post.");
        }
      } finally {
        if (isMounted) {
          setPostLoading(false);
          setCommentLoading(false);
        }
      }
    };

    loadPage();

    return () => {
      isMounted = false;
    };
  }, [postId]);

  if (postLoading) return <p>Loading post...</p>;
  if (postError) return <p>{postError}</p>;
  if (!post) return <p>Post not found</p>;

  const handleLike = async () => {
    try {
      const result = await likePost(postId);
      setVote(result.vote);
      setLikes(result.likes);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownvote = async () => {
    try {
      const result = await downvotePost(postId);
      setVote(result.vote);
      setLikes(result.likes);
    } catch (err) {
      console.error(err);
    }
  };
  const handleAddComment = async (text) => {
    setCommentError("");
    setIsSubmittingComment(true);
    try {
      await addComment(postId, text);
      const cdata = await getCommentsByPostId(postId);
      setComments(cdata);
    } catch (err) {
      console.error(err);
      setCommentError(err.message || "Failed to add comment.");
    } finally {
      setIsSubmittingComment(false);
    }
  };
  return (
    <div className="post-details">
      <h1>{post.title}</h1>
      {post.imageUrl && (
        <img
          className="post-details-image"
          src={post.imageUrl}
          alt={post.title}
        />
      )}
      {post.tags && post.tags.trim().length > 0 && (
        <div className="post-details-tags">
          <strong>Tags:</strong> {post.tags}
        </div>
      )}
      <p className="post-details-author">
        <strong>Author:</strong> {post.author}
      </p>
      <div className="post-details-content">
        {post.content}
      </div>
      <div className="post-actions">
        <button
          className={vote === 1 ? "like-btn is-active" : "like-btn"}
          onClick={handleLike}
        >
          {vote === 1 ? "Unlike" : "Like"}
        </button>
        <button
          className={vote === -1 ? "downvote-btn is-active" : "downvote-btn"}
          onClick={handleDownvote}
        >
          {vote === -1 ? "Remove downvote" : "Downvote"}
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
        <AddCommentForm onAddComment={handleAddComment} isSubmitting={isSubmittingComment} />
        {commentLoading && <p>Loading comments...</p>}
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
 
