import { useParams } from "react-router-dom";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllPosts, deletePost } from "../../services/postService";
import CommentList from "../../components/CommentList/CommentList";
import AddCommentForm from "../../components/AddCommentForm/AddCommentForm.jsx";
import { likePost } from "../../services/postService.js";

function PostDetails() {
    const { postId } = useParams();
    const navigate = useNavigate()

    const posts = getAllPosts();
    const post = posts.find(p => p.id === Number(postId));

    if (!post) {
        return <p>Post not found</p>;
    }

    const [comments, setComments] = useState(post ? post.comments : []);
    const [likes, setLikes] = useState(post.likes)

    const handleAddComment = (text) => {
        const newComment = {
            id: comments.length + 1,
            author: "CurrentUser",
            text: text
        };

        setComments([...comments, newComment]);
    };

    const handleLike = () => {
        likePost(post.id);
        setLikes(prev => prev + 1);
    };

    const handleDelete = () => {
        deletePost(post.id);
        navigate("/")
    }


    return (
        <div>
            <h6>{post.tags}</h6>
            <h1>{post.title}</h1>
<<<<<<< HEAD
            <p>{post.content}</p>
=======
            <button onClick={handleDelete}>
                Delete Post
            </button>
            <button onClick={() => navigate(`/edit/${post.id}`)}>
                Edit Post
            </button>
>>>>>>> a6d1439686d93ba7a500d6ad10030d5b63991722
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
