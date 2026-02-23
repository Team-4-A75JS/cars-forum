import "./PostItem.css";
import { Link } from "react-router-dom";

function PostItem({ post }) {
    return (
        <li className="post-card">
            <h3>
                <Link to={`/posts/${post.id}`}>
                    {post.title}
                </Link>
            </h3>
            <h6>Tags: {post.tags}</h6>
            <p>Author: {post.author}</p>
            <p>Likes: {post.likes}</p>
            <p>Comments: {post.comments ? post.comments.length : 0}</p>
        </li>
    );
}

export default PostItem;
