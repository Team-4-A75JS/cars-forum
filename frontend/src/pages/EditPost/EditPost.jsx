import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchPostById, updatePost } from "../../services/postServiceSupabase";

function EditPost() {
  const { postId } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    const load = async () => {
      const post = await fetchPostById(postId);
      if (post) {
        setTitle(post.title);
        setContent(post.content);
      }
    };
    load();
  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updated = await updatePost(postId, {
      title,
      content,
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