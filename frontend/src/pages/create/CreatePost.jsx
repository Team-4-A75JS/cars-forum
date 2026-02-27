import { useState } from "react";
import { addPost } from "../../services/postService";
import { useNavigate } from "react-router-dom";

function CreatePost() {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg("");

        try {
            await addPost({ title, content });
            navigate("/");
        } catch (error) {
            setErrorMsg(error.message || "Failed to create post.");
        } finally {
            setLoading(false);
        }

    };

    return (
        <div>
            <h1>Create Post</h1>

            <form onSubmit={handleSubmit}>
                <div>
                    <label>Title:</label><br />
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        minLength={16}
                        maxLength={64}
                        required
                    />
                </div>

                <div>
                    <label>Content:</label><br />
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        minLength={32}
                        maxLength={8192}
                        required
                    />
                </div>

                <br />
                <button type="submit" disabled={loading}>
                    {loading ? "Creating..." : "Create Post"}
                </button>
            </form>

            {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
        </div>
    );
}

export default CreatePost;
