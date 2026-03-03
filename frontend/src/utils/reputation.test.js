import { describe, expect, it, vi } from "vitest";
import {
  buildProfileStats,
  getBadgesForProfile,
  getPrimaryBadge,
} from "./reputation";

describe("reputation utils", () => {
  it("buildProfileStats maps fallback keys and calculates member days", () => {
    const now = new Date("2026-03-03T12:00:00.000Z");
    vi.useFakeTimers();
    vi.setSystemTime(now);

    const stats = buildProfileStats({
      reputation: 12,
      posts_count: 4,
      comments_count: 7,
      created_at: "2026-02-28T12:00:00.000Z",
    });

    expect(stats).toEqual({
      reputation: 12,
      postsCount: 4,
      commentsCount: 7,
      memberDays: 3,
    });

    vi.useRealTimers();
  });

  it("awards badges when profile passes multiple milestones", () => {
    const badges = getBadgesForProfile({
      reputation: 130,
      postsCount: 10,
      commentsCount: 14,
      createdAt: "2026-02-25T12:00:00.000Z",
    });

    expect(badges.map((badge) => badge.id)).toEqual([
      "first-post",
      "builder",
      "discussant",
      "trusted",
      "top-contributor",
      "regular",
    ]);
  });

  it("returns the highest earned badge as primary badge", () => {
    const primaryBadge = getPrimaryBadge({
      reputation: 130,
      postsCount: 10,
      commentsCount: 14,
      createdAt: "2026-02-25T12:00:00.000Z",
    });

    expect(primaryBadge?.id).toBe("regular");
  });
});
