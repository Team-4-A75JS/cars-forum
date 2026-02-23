import { useState } from "react";

function AddCommentForm({ onAddComment }) {
    const [text, setText] = useState("")

    const handleSubmit = (e) => {
        e.preventDefault();

        if (text.trim() === "") return;

        onAddComment(text)
        setText("");
    }

    return (
        <form onSubmit={handleSubmit}>
            <textarea
                placeholder="Write a comment..."
                value={text}
                onChange={(e) => setText(e.target.value)}
            />

            <button type="submit">Add Comment</button>
        </form>
    )
}

export default AddCommentForm;