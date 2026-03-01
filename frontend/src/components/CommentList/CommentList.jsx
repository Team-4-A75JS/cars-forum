import CommentItem from "../CommentItem/CommentItem.jsx";
import "./CommentList.css";

function CommentList({ comments, currentProfile, onDeleteComment }) {
    if (!comments || comments.length === 0) {
        return <p>No comments yet.</p>;
    }

    return (
        <div>
            {comments.map(comment => {
                const canDelete =
                    currentProfile &&
                    (currentProfile.role === "admin" || currentProfile.id === comment.authorId);
                return (
                    <CommentItem
                        key={comment.id}
                        comment={comment}
                        canDelete={canDelete}
                        onDelete={() => onDeleteComment && onDeleteComment(comment.id)}
                    />
                );
            })}
        </div>
    );
}


export default CommentList;         