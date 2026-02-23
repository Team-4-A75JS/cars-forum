import PostItem from "../PostItem/postItem";

export default function PostList({ posts }) {
    return (
        <ul>
            {posts.map(post => (
                <PostItem key={post.id} post={post} />
            ))}
        </ul>
    );
}

