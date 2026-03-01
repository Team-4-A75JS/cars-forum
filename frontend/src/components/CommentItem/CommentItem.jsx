import "./CommentItem.css";
import { getPrimaryBadge } from "../../utils/reputation";

function CommentItem({ comment, canDelete = false, onDelete }) {
    const primaryBadge = getPrimaryBadge({
        reputation: comment.authorReputation,
        postsCount: comment.authorPostsCount,
        commentsCount: comment.authorCommentsCount,
        createdAt: comment.authorCreatedAt,
    });

    return (
        <div className="comment-item">
            <p className="comment-author-line">
                <strong>{comment.author}</strong>
                {primaryBadge && (
                    <span className={`badge-chip badge-${primaryBadge.color}`}>
                        {primaryBadge.label}
                    </span>
                )}
            </p>
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
