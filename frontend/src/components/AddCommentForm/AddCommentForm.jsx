import { useState } from "react";

function AddCommentForm({ onAddComment, isSubmitting = false }) {
    const [text, setText] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (text.trim() === "") return;

        try {
            await onAddComment(text);
            setText("");
        } catch {
            // Error state is handled by the parent component.
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <textarea
                placeholder="Write a comment..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={isSubmitting}
            />

            <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Comment"}
            </button>
        </form>
    )
}

export default AddCommentForm;
