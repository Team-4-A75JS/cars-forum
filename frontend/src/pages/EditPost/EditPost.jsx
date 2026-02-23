import { useParams } from "react-router-dom";
import { getAllPosts } from "../../services/postService";

function EditPost() {
    const { postId } = useParams();

    const posts = getAllPosts();
    const post = posts.find(p => p.id === Number(postId))

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