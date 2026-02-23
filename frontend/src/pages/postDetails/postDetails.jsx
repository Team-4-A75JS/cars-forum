import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { deletePost, getAllPosts, likePost } from "../../services/postService";
import CommentList from "../../components/CommentList/CommentList";
import AddCommentForm from "../../components/AddCommentForm/AddCommentForm.jsx";

function PostDetails() {
    const { postId } = useParams();
    const navigate = useNavigate();

    const posts = getAllPosts();
    const post = posts.find(p => p.id === Number(postId));
    const [comments, setComments] = useState(post?.comments ?? []);
    const [likes, setLikes] = useState(post?.likes ?? 0);

    if (!post) {
        return <p>Post not found</p>;
    }

    const handleAddComment = (text) => {
        const newComment = {
            id: comments.length + 1,
            author: "CurrentUser",
            text,
        };

        setComments([...comments, newComment]);
    };

    const handleLike = () => {
        likePost(post.id);
        setLikes(prev => prev + 1);
    };

    const handleDelete = () => {
        deletePost(post.id);
        navigate("/");
    };

    return (
        <div>
            <h6>{post.tags}</h6>
            <h1>{post.title}</h1>
            <p>{post.content}</p>
            <button onClick={handleDelete}>Delete Post</button>
            <button onClick={() => navigate(`/edit/${post.id}`)}>Edit Post</button>
            <p><strong>Author:</strong> {post.author}</p>
            <p><strong>Likes:</strong> {likes}</p>
            <button onClick={handleLike}>👍 Like</button>

            <h2>Comments</h2>
            <CommentList comments={comments} />

            <AddCommentForm onAddComment={handleAddComment} />
        </div>
    );
}

export default PostDetails;
