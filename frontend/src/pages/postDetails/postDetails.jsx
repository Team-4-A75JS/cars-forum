import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    addComment,
    deletePost,
    getCommentsByPostId,
    getPostById,
    likePost,
} from "../../services/postService";
import CommentList from "../../components/CommentList/CommentList";
import AddCommentForm from "../../components/AddCommentForm/AddCommentForm.jsx";

function PostDetails() {
    const { postId } = useParams();
    const navigate = useNavigate();

    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [likes, setLikes] = useState(0);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");
    const [commentErrorMsg, setCommentErrorMsg] = useState("");
    const [isCommenting, setIsCommenting] = useState(false);
    const [isLiking, setIsLiking] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const loadPost = async () => {
            setLoading(true);
            setErrorMsg("");

            try {
                const postData = await getPostById(postId);
                if (!isMounted) return;

                if (!postData) {
                    setPost(null);
                    setComments([]);
                    setLikes(0);
                    return;
                }

                const commentsData = await getCommentsByPostId(postId);
                if (!isMounted) return;

                setPost(postData);
                setComments(commentsData);
                setLikes(postData.likes);
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
        return <p>Post not found</p>;
    }

    const handleAddComment = async (text) => {
        setCommentErrorMsg("");
        setIsCommenting(true);

        try {
            const newComment = await addComment(post.id, text);
            setComments((prevComments) => [...prevComments, newComment]);
        } catch (error) {
            setCommentErrorMsg(error.message || "Failed to add comment.");
            throw error;
        } finally {
            setIsCommenting(false);
        }
    };

    const handleLike = async () => {
        setIsLiking(true);
        setErrorMsg("");

        try {
            const result = await likePost(post.id);
            setLikes(result.likes);
        } catch (error) {
            setErrorMsg(error.message || "Failed to update like.");
        } finally {
            setIsLiking(false);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        setErrorMsg("");

        try {
            await deletePost(post.id);
            navigate("/");
        } catch (error) {
            setErrorMsg(error.message || "Failed to delete post.");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div>
            <h1>{post.title}</h1>
            <p>{post.content}</p>
            <button onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? "Deleting..." : "Delete Post"}
            </button>
            <button onClick={() => navigate(`/edit/${post.id}`)}>Edit Post</button>
            <p><strong>Author:</strong> {post.author}</p>
            <p><strong>Likes:</strong> {likes}</p>
            <button onClick={handleLike} disabled={isLiking}>
                {isLiking ? "Updating..." : "👍 Like"}
            </button>

            <h2>Comments</h2>
            <CommentList comments={comments} />

            <AddCommentForm onAddComment={handleAddComment} isSubmitting={isCommenting} />
            {commentErrorMsg && <p style={{ color: "red" }}>{commentErrorMsg}</p>}
        </div>
    );
}

export default PostDetails;
