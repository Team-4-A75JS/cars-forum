import "./postItem.css";
import { useState } from "react";
import { Link } from "react-router-dom";
import { downvotePost, likePost } from "../../services/postService";

function PostItem({ post }) {
  const commentsCount =
    typeof post.commentsCount === "number"
      ? post.commentsCount
      : (post.comments?.length ?? 0);

  const [likes, setLikes] = useState(post.likes ?? 0);
  const [vote, setVote] = useState(post.userVote ?? 0);

  const handleLike = async () => {
    try {
      const res = await likePost(post.id);
      setVote(res.vote);
      setLikes(res.likes);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownvote = async () => {
    try {
      const res = await downvotePost(post.id);
      setVote(res.vote);
      setLikes(res.likes);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <li className="post-card">
      {post.imageUrl && (
        <Link
          to={`/posts/${post.id}`}
          className="post-card-image-link"
          aria-label={`Open ${post.title}`}
        >
          <img
            className="post-card-image"
            src={post.imageUrl}
            alt={post.title}
            loading="lazy"
          />
        </Link>
      )}

      <h3>
        <Link to={`/posts/${post.id}`}>{post.title}</Link>
      </h3>

      {post.tags && post.tags.trim().length > 0 && (
        <p className="post-card-tags">
          <strong>Tags:</strong> {post.tags}
        </p>
      )}

      <p className="post-author-line">
        Author: {post.author}
      </p>
      <p className="post-card-excerpt">{post.content}</p>
      <p className="post-vote-row">
        <button
          className={vote === 1 ? "vote-button is-active" : "vote-button"}
          onClick={handleLike}
        >
          {vote === 1 ? "Unlike" : "Like"}
        </button>
        <button
          className={vote === -1 ? "vote-button is-active danger" : "vote-button danger"}
          onClick={handleDownvote}
        >
          {vote === -1 ? "Remove downvote" : "Downvote"}
        </button>
        {likes} likes
      </p>
      <p>Comments: {commentsCount}</p>
    </li>
  );
}

export default PostItem;
