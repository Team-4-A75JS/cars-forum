const posts = [
  {
    id: 1,
    title: "BMW M3 engine problem",
    content: "Hello, my M3 engine seems to be misfiring, could anyone provide any insight as to how I could properly identify the issue at hand?",
    author: "Ivan",
    likes: 12,
    tags: "BMW",
    comments: [
      {
        id: 1,
        author: "Pesho",
        text: "Great review!"
      },
      {
        id: 2,
        author: "Maria",
        text: "I love this car."
      }
    ]
  },
  {
    id: 2,
    title: "Audi A4 suspension noise",
    content: "Greetings! My Audi is wayyy too noisy nowadays why is it so?",
    author: "Petar",
    likes: 5,
    tags: "Audi",
    comments: [
      {
        id: 1,
        author: "John",
        text: "It could be from a torn tampon."
      }
    ]
  },
  {
    id: 3,
    title: "Mercedes C220 tuning ideas",
    content: "Hi! I just recently bought my C220 and I was wondering what I could potentially could/should do to it?",
    author: "Georgi",
    likes: 20,
    tags: "Mercedes",
    comments: [
      {
        id: 1,
        author: "Ivan",
        text: "Put a spoiler."
      },
      {
        id: 2,
        author: "Georgi",
        text: "Put on 19 rims."
      },
      {
        id: 3,
        author: "Valentin",
        text: "Put a turbo on it."
      }
    ]
  },
];

export function getAllPosts() {
  return posts;
}

export function deletePost(postId) {
  const index = posts.findIndex(p => p.id === postId)

  if (index !== -1){
    posts.splice(index,1)
  }
}

export function likePost(postId) {
  const post = posts.find(p => p.id === postId);
  if (post) {
    post.likes += 1;
  }
}

export function addPost(newPost) {
  const nextId = posts.length + 1;

  posts.push({
    id: nextId,
    title: newPost.title,
    content: newPost.content,
    author: newPost.author,
    likes: 0,
    tags: newPost.tags,
    comments: []
  });
}

