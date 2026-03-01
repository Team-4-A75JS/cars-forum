import PostItem from "../PostItem/postItem.jsx";

export default function PostList({ posts }) {
  return (
    <ul className="posts-list">
      {posts.map((post) => (
        <PostItem key={post.id} post={post} />
      ))}
    </ul>
  );
}
