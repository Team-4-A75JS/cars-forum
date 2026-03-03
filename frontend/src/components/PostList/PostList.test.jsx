import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import PostList from "./PostList.jsx";

vi.mock("../../services/postService", () => ({
  likePost: vi.fn(),
  downvotePost: vi.fn(),
}));

describe("PostList", () => {
  it("renders post titles, author names, and like counts", () => {
    render(
      <MemoryRouter>
        <PostList
          posts={[
            {
              id: "1",
              title: "Best BMW tuning setup for daily driving",
              author: "kaloyan",
              content: "Some content",
              likes: 6,
              commentsCount: 2,
              tags: "bmw,tuning",
              userVote: 0,
            },
            {
              id: "2",
              title: "How to keep an old Mercedes reliable",
              author: "ivan",
              content: "Some other content",
              likes: 3,
              commentsCount: 1,
              tags: "",
              userVote: 0,
            },
          ]}
        />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("link", {
        name: /best bmw tuning setup for daily driving/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("kaloyan")).toBeInTheDocument();
    expect(screen.getByText(/6 likes/i)).toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: /how to keep an old mercedes reliable/i,
      }),
    ).toBeInTheDocument();
  });
});
