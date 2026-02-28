import "./PostItem.css";
import { useState } from "react";
import { Link } from "react-router-dom";
import { likePost } from "../../services/postService";

function PostItem({ post }) {
    const commentsCount = typeof post.commentsCount === "number"
        ? post.commentsCount
        : (post.comments?.length ?? 0);

    const [likes, setLikes] = useState(post.likes ?? 0);
    const [liked, setLiked] = useState(false);

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
            <h3>
                <Link to={`/posts/${post.id}`}>
                    {post.title}
                </Link>
            </h3>
            {post.tags && post.tags.trim().length > 0 && (
                <div style={{ backgroundColor: "#f5f5f5", padding: "8px 12px", borderRadius: "4px", marginBottom: "10px", fontSize: "13px" }}>
                    <strong style={{ color: "#666" }}>Tags:</strong> <span style={{ color: "#333" }}>{post.tags}</span>
                </div>
            )}
            <p>Author: {post.author}</p>
            <p>
              <button onClick={handleLike} style={{marginRight:'4px'}}>{liked ? 'Unlike' : 'Like'}</button>
              {likes} likes
            </p>
            <p>Comments: {commentsCount}</p>
        </li>
    );
}

export default PostItem;
