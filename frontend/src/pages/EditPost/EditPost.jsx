import { useParams, useNavigate } from "react-router-dom";
import { getAllPosts, updatePost } from "../../services/postService";
import { useState } from "react";

function EditPost() {
    const { postId } = useParams();
    const navigate = useNavigate();

    const posts = getAllPosts();
    const post = posts.find(p => p.id === Number(postId));

    if (!post) {
        return <p>Post not found</p>;
    }

    const [title, setTitle] = useState(post.title);
    const [content, setContent] = useState(post.content || "");
    const [error, setError] = useState("");

    const handleSave = () => {
        if (title.length < 16 || title.length > 64) {
            setError("Title must be between 16 and 64 characters.");
            return;
        }

        if (content.length < 32 || content.length > 8192) {
            setError("Content must be between 32 and 8192 characters.");
            return;
        }

        setError("")
        updatePost(post.id, { title, content });
        navigate(`/posts/${post.id}`);
    };

    return (
        <div>
            <h1>Edit Post</h1>

            {error && <p style={{ color: "red" }}>{error}</p>}

            <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />

            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
            />

            <button onClick={handleSave}>
                Save
            </button>
        </div>
    );
}

export default EditPost; 