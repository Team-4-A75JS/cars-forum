import "./home.css"
import PostItem from "../../components/PostItem/postItem";

function Home() {
  const posts = [
    {
      id: 1,
      title: "BMW M3 engine problem",
      author: "Ivan",
      likes: 12,
    },
    {
      id: 2,
      title: "Audi A4 suspension noise",
      author: "Petar",
      likes: 5,
    },
    {
      id: 3,
      title: "Mercedes C220 tuning ideas",
      author: "Georgi",
      likes: 20,
    },
  ];

  return (
    <div className="home-container">
      <h1>Latest Posts</h1>

      <ul>
        {posts.map((post) => (
          <PostItem key={post.id} post={post} />
        ))}
      </ul>
    </div>
  );

}

export default Home;
