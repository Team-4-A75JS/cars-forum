import CommentItem from "../CommentItem/CommentItem.jsx";

function CommentList({ comments }) {
    if (comments.length === 0) {
        return <p>No comments yet.</p>
    }

    return (
        <div>
            {comments.map(comment => (
                <CommentItem key={comment.id} comment={comment} />
            ))};
        </div>
    );
}

export default CommentList;         