import "./postItem.css";
import { useState } from "react";
import { Link } from "react-router-dom";
import { likePost } from "../../services/postService";
import { getPrimaryBadge } from "../../utils/reputation";

function PostItem({ post }) {
  const commentsCount =
    typeof post.commentsCount === "number"
      ? post.commentsCount
      : (post.comments?.length ?? 0);

  const [likes, setLikes] = useState(post.likes ?? 0);
  const [liked, setLiked] = useState(false);
  const primaryBadge = getPrimaryBadge({
    reputation: post.authorReputation,
    postsCount: post.authorPostsCount,
    commentsCount: post.authorCommentsCount,
    createdAt: post.authorCreatedAt,
  });

  const handleLike = async () => {
    try {
      const res = await likePost(post.id);
      setLiked(res.liked);
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

      <div className="post-author-line">
        <span>Author:</span>

        <img
          src={post.authorAvatar || "/default-avatar.png"}
          alt=""
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            objectFit: "cover",
          }}
          onError={(e) => {
            e.currentTarget.src = "/default-avatar.png";
          }}
        />

        <span>{post.author}</span>

        {primaryBadge && (
          <span className={`badge-chip badge-${primaryBadge.color}`}>
            {primaryBadge.label}
          </span>
        )}
      </div>

      <p className="post-card-excerpt">{post.content}</p>
      <p>
        <button onClick={handleLike}>{liked ? "Unlike" : "Like"}</button>
        {likes} likes
      </p>
      <p>Comments: {commentsCount}</p>
    </li>
  );
}

export default PostItem;
