const posts = [
  {
    id: 1,
    title: "BMW M3 engine problem",
    author: "Ivan",
    likes: 12,
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
    author: "Petar",
    likes: 5,
  },
  {
    id: 3,
    title: "Mercedes C220 tuning ideas",
    author: "Georgi",
    likes: 20,
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