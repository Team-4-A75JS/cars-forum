import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../config/supabase-config";
import { createPost } from "../../services/postServiceSupabase";

function CreatePost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    if (!title.trim()) {
      newErrors.title = "Title is required";
    } else if (title.length < 5) {
      newErrors.title = "Title must be at least 5 characters";
    } else if (title.length > 64) {
      newErrors.title = "Title must not exceed 64 characters";
    }

    if (!content.trim()) {
      newErrors.content = "Content is required";
    } else if (content.length < 10) {
      newErrors.content = "Content must be at least 10 characters";
    } else if (content.length > 8192) {
      newErrors.content = "Content must not exceed 8192 characters";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        setErrors({ submit: "User not authenticated" });
        return;
      }

      const postData = {
        title: title.trim(),
        content: content.trim(),
        author_id: data.user.id,
      };

      const result = await createPost(postData);

      if (result) {
        navigate("/");
      } else {
        setErrors({ submit: "Failed to create post. Please try again." });
      }
    } catch (err) {
      setErrors({ submit: "An error occurred. Please try again." });
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h1>Create Post</h1>

      {errors.submit && (
        <div style={{ color: "red", marginBottom: "10px", padding: "10px", backgroundColor: "#ffe6e6", borderRadius: "4px" }}>
          {errors.submit}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <label>Title:</label>
          <br />
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter post title (5-64 characters)"
            style={{
              width: "100%",
              padding: "8px",
              borderColor: errors.title ? "red" : "#ccc",
              border: "1px solid",
              borderRadius: "4px",
            }}
          />
          {errors.title && <div style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>{errors.title}</div>}
          <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
            {title.length} / 64 characters
          </div>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Content:</label>
          <br />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter post content (10-8192 characters)"
            rows="8"
            style={{
              width: "100%",
              padding: "8px",
              borderColor: errors.content ? "red" : "#ccc",
              border: "1px solid",
              borderRadius: "4px",
              fontFamily: "Arial, sans-serif",
            }}
          />
          {errors.content && <div style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>{errors.content}</div>}
          <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
            {content.length} / 8192 characters
          </div>
        </div>

        <br />
        <button type="submit" disabled={isSubmitting} style={{ padding: "8px 16px", cursor: isSubmitting ? "not-allowed" : "pointer", opacity: isSubmitting ? 0.6 : 1 }}>
          {isSubmitting ? "Creating..." : "Create Post"}
        </button>
      </form>
    </div>
  );
}

export default CreatePost;