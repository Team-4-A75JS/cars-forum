import { useState } from "react";

export default function Comments() {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  const addComment = () => {
    if (newComment.trim() === "") return;

    const commentObj = {
      id: Date.now(),
      text: newComment,
      replies: [],
      likes: 0,
    };

    setComments([...comments, commentObj]);
    setNewComment("");
  };

  const deleteComment = (id) => {
    setComments(comments.filter((c) => c.id !== id));
  };

  const addReply = (commentId, replyText) => {
    setComments((prev) =>
      prev.map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              replies: [
                ...comment.replies,
                { id: Date.now(), text: replyText, likes: 0 },
              ],
            }
          : comment
      )
    );
  };

const likeComment = (commentId) => {
  setComments((prev) =>
    prev.map((comment) =>
      comment.id === commentId
        ? {
            ...comment,
            liked: !comment.liked,
            likes: comment.liked ? comment.likes - 1 : comment.likes + 1,
          }
        : comment
    )
  );
};

  return (
    <div>
      <h3>Comments</h3>

      <input
        type="text"
        placeholder="Share your opinion here.."
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
      />
      <button onClick={addComment}>Add</button>

      <div>
        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            onDelete={deleteComment}
            onReply={addReply}
            onLike={likeComment}
          />
        ))}
      </div>
    </div>
  );
}

function CommentItem({comment, onDelete, onReply, onLike  }) {
  const [replyText, setReplyText] = useState("");

  const handleReply = () => {
    if (replyText.trim() === "") return;
    onReply(comment.id, replyText);
    setReplyText("");
  };

  return (
    <div>
      <p>{comment.text}</p>

      <button onClick={() => onDelete(comment.id)}>Delete</button>

      <button onClick={() => onLike(comment.id)}>Like</button>
      <span>{comment.likes}</span>

      <div>
        <input
          type="text"
          placeholder="Reply..."
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
        />
        <button onClick={handleReply}>Reply</button>
      </div>

      {comment.replies.length > 0 && (
        <div>
          {comment.replies.map((reply) => (
            <div key={reply.id}>
              {reply.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
