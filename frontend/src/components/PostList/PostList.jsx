import PostItem from "../PostItem/PostItem.jsx";

export default function PostList({ posts }) {
    return (
        <ul>
            {posts.map(post => (
                <PostItem key={post.id} post={post} />
            ))}
        </ul>
    );
}

