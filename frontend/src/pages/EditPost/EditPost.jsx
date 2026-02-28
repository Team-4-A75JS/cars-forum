import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPostById, updatePost } from "../../services/postService";

function EditPost() {
  const { postId } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");

  useEffect(() => {
    const load = async () => {
      const post = await getPostById(postId);
      if (post) {
        setTitle(post.title);
        setContent(post.content);
        setTags(post.tags || "");
      }
    };
    load();
  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updated = await updatePost(postId, {
      title,
      content,
      tags,
    });

    if (updated) navigate(`/posts/${postId}`);
  };

  return (
    <div>
      <h1>Edit Post</h1>

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
          <label>Content:</label>
          <br />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>

        <br />
        <button type="submit">Save</button>
      </form>
    </div>
  );
}

export default EditPost;