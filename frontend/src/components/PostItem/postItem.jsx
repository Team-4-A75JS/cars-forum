import "./PostItem.css";
import { Link } from "react-router-dom";

function PostItem({ post }) {
    const commentsCount = typeof post.commentsCount === "number"
        ? post.commentsCount
        : (post.comments?.length ?? 0);

    return (
        <li className="post-card">
            <h3>
                <Link to={`/posts/${post.id}`}>
                    {post.title}
                </Link>
            </h3>
            <h6>Tags: {post.tags || "N/A"}</h6>
            <p>Author: {post.author}</p>
            <p>Likes: {post.likes}</p>
            <p>Comments: {commentsCount}</p>
        </li>
    );
}

export default PostItem;
