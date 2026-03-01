import "./CommentItem.css";

function CommentItem({ comment, canDelete = false, onDelete }) {
    return (
        <div className="comment-item">
            <p><strong>{comment.author}</strong></p>
            <p>{comment.text}</p>
            {canDelete && (
                <button onClick={() => onDelete && onDelete()}>
                    Delete
                </button>
            )}
        </div>
    );
}

export default CommentItem;
