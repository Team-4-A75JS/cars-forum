function CommentItem() {
    return (
        <div className="comment-item">
            <p><strong>{comment.author}</strong></p>
            <p>{comment.text}</p>
        </div>
    )
}

export default CommentItem;