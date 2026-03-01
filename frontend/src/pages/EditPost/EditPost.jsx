import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPostById, updatePost, uploadPostImage } from "../../services/postService";

function EditPost() {
  const { postId } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      const post = await getPostById(postId);
      if (post) {
        setTitle(post.title);
        setContent(post.content);
        setTags(post.tags || "");
        setImageUrl(post.imageUrl || "");
      }
    };
    load();
  }, [postId]);

  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl(imageUrl.trim());
      return undefined;
    }

    const objectUrl = URL.createObjectURL(imageFile);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile, imageUrl]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setIsSubmitting(true);

    try {
      let finalImageUrl = imageUrl.trim();

      if (imageFile) {
        if (!imageFile.type.startsWith("image/")) {
          throw new Error("Selected file must be an image.");
        }
        if (imageFile.size > 5 * 1024 * 1024) {
          throw new Error("Image must be 5MB or less.");
        }

        const uploadResult = await uploadPostImage(imageFile);
        finalImageUrl = uploadResult.publicUrl;
      }

      const updated = await updatePost(postId, {
        title,
        content,
        tags,
        imageUrl: finalImageUrl,
      });

      if (updated) navigate(`/posts/${postId}`);
    } catch (error) {
      setErrorMsg(error.message || "Failed to update post.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h1>Edit Post</h1>
      {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Title:</label>
          <br />
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Tags:</label>
          <br />
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Comma-separated tags"
          />
        </div>

        <div>
          <label>Upload new image:</label>
          <br />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
          />
        </div>

        {previewUrl && (
          <div style={{ marginTop: "12px", marginBottom: "12px" }}>
            <img
              src={previewUrl}
              alt="Post preview"
              style={{ width: "100%", maxHeight: "280px", objectFit: "cover", borderRadius: "8px", border: "1px solid #ccc" }}
            />
          </div>
        )}

        {(previewUrl || imageUrl) && (
          <button
            type="button"
            onClick={() => {
              setImageFile(null);
              setImageUrl("");
              setPreviewUrl("");
            }}
            style={{ marginBottom: "12px" }}
          >
            Remove image
          </button>
        )}

        <div>
          <label>Content:</label>
          <br />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>

        <br />
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save"}
        </button>
      </form>
    </div>
  );
}

export default EditPost;
