import "./postItem.css";

function PostItem({ post }) {
    return (
        <li className="post-card">
            <h3>{post.title}</h3>
            <p>Author: {post.author}</p>
            <p>Likes: {post.likes}</p>
        </li>
    );
}

export default PostItem;
