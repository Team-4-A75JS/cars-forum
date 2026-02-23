import { useState } from "react";
import { addPost } from "../../services/postService";
import { useNavigate } from "react-router-dom";

function CreatePost() {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [author, setAuthor] = useState("");
    const [tags, setTag] = useState("");

    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();

        addPost({
            title,
            content,
            author, 
            tags
        });

        navigate("/");
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
                        required
                    />
                </div>

                <div>
                    <label>Content:</label><br />
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label>Author:</label><br />
                    <input
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        required
                    />
                </div>
                
                <div>
                    <label>Tags:</label><br />
                    <input
                        value={tags}
                        onChange={(e) => setTag(e.target.value)}
                        required
                    />
                </div>

                <br />
                <button type="submit">Create Post</button>
            </form>
        </div>
    );
}

export default CreatePost;