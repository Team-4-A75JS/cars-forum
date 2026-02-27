import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getPostById } from "../../services/postService";

function EditPost() {
    const { postId } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        let isMounted = true;

        const loadPost = async () => {
            setLoading(true);
            setErrorMsg("");

            try {
                const data = await getPostById(postId);
                if (isMounted) {
                    setPost(data);
                }
            } catch (error) {
                if (isMounted) {
                    setErrorMsg(error.message || "Failed to load post.");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadPost();

        return () => {
            isMounted = false;
        };
    }, [postId]);

    if (loading) {
        return <p>Loading post...</p>;
    }

    if (errorMsg) {
        return <p style={{ color: "red" }}>{errorMsg}</p>;
    }

    if (!post) {
        return <p>Post not found</p>
    }

    return (
        <div>
            <h1>Edit Post</h1>

            <input defaultValue={post.title} />
            <textarea defaultValue={post.content || ""} />

            <button>Save</button>
        </div>
    )
}

export default EditPost;
