import { useParams } from "react-router-dom";
import { getAllPosts } from "../../services/postService";
import Comments from "../../components/Comments/Comments";

function PostDetails() {
    const { postId } = useParams();

    const posts = getAllPosts();
    const post = posts.find(p => p.id === Number(postId));

    if (!post) {
        return <p>Post not found</p>
    }

    return (
        <div>
            <h1>{post.title}</h1>
            <p><strong>Author:</strong> {post.author}</p>
            <p><strong>Likes:</strong> {post.likes}</p>
            <p>{post.content}</p>
            <Comments></Comments>
        </div>
    );
}

export default PostDetails;