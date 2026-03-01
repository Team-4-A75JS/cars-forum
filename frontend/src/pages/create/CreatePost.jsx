import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { addPost, uploadPostImage } from "../../services/postService";
import { supabase } from "../../config/supabase-config";
import "./CreatePost.css";

function CreatePost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl("");
      return undefined;
    }

    const objectUrl = URL.createObjectURL(imageFile);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile]);

  const validateForm = () => {
    const newErrors = {};

    if (!title.trim()) {
      newErrors.title = "Title is required";
    } else if (title.length < 16) {
      newErrors.title = "Title must be at least 16 characters";
    } else if (title.length > 64) {
      newErrors.title = "Title must not exceed 64 characters";
    }

    if (!content.trim()) {
      newErrors.content = "Content is required";
    } else if (content.length < 32) {
      newErrors.content = "Content must be at least 32 characters";
    } else if (content.length > 8192) {
      newErrors.content = "Content must not exceed 8192 characters";
    }

    if (tags.length > 64) {
      newErrors.tags = "Tags must not exceed 64 characters total";
    }

    if (imageFile && !imageFile.type.startsWith("image/")) {
      newErrors.imageFile = "Selected file must be an image";
    }

    if (imageFile && imageFile.size > 5 * 1024 * 1024) {
      newErrors.imageFile = "Image must be 5MB or less";
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
      // Check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        setErrors({ submit: "You must be logged in to create a post." });
        setIsSubmitting(false);
        return;
      }

      let finalImageUrl = "";

      if (imageFile) {
        const uploadResult = await uploadPostImage(imageFile);
        finalImageUrl = uploadResult.publicUrl;
      }

      await addPost({ title, content, tags, imageUrl: finalImageUrl });
      navigate("/");
    } catch (err) {
      console.error("Post creation error:", err);
      const errorMsg = err.message || "Failed to create post. Please try again.";
      setErrors({ submit: errorMsg });
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
            placeholder="Enter post title (16-64 characters)"
            style={{
              width: "100%",
              padding: "8px",
              border: `1px solid ${errors.title ? "red" : "#ccc"}`,
              borderRadius: "4px",
            }}
          />
          {errors.title && <div style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>{errors.title}</div>}
          <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
            {title.length} / 64 characters
          </div>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Tags:</label>
          <br />
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Comma-separated tags (max 64 chars total)"
            style={{
              width: "100%",
              padding: "8px",
              border: `1px solid ${errors.tags ? "red" : "#ccc"}`,
              borderRadius: "4px",
            }}
          />
          {errors.tags && <div style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>{errors.tags}</div>}
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Upload image:</label>
          <br />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
          />
          {errors.imageFile && <div style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>{errors.imageFile}</div>}
          <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
            Optional. Upload an image file up to 5MB.
          </div>
        </div>

        {previewUrl && (
          <div style={{ marginBottom: "15px" }}>
            <div style={{ fontSize: "12px", color: "#666", marginBottom: "6px" }}>Preview</div>
            <img
              src={previewUrl}
              alt="Post preview"
              style={{ width: "100%", maxHeight: "280px", objectFit: "cover", borderRadius: "8px", border: "1px solid #ccc" }}
            />
          </div>
        )}

        <div style={{ marginBottom: "15px" }}>
          <label>Content:</label>
          <br />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter post content (32-8192 characters)"
            rows="8"
            style={{
              width: "100%",
              padding: "8px",
              border: `1px solid ${errors.content ? "red" : "#ccc"}`,
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
