const DAY_IN_MS = 1000 * 60 * 60 * 24;

function getMemberDays(createdAt) {
  if (!createdAt) return 0;
  const createdTime = new Date(createdAt).getTime();
  if (Number.isNaN(createdTime)) return 0;
  return Math.max(0, Math.floor((Date.now() - createdTime) / DAY_IN_MS));
}

export function buildProfileStats(profile = {}) {
  return {
    reputation: profile.reputation ?? 0,
    postsCount: profile.postsCount ?? profile.posts_count ?? 0,
    commentsCount: profile.commentsCount ?? profile.comments_count ?? 0,
    memberDays: getMemberDays(profile.createdAt ?? profile.created_at),
  };
}

export function getBadgesForProfile(profile = {}) {
  const stats = buildProfileStats(profile);
  const badges = [];

  if (stats.postsCount >= 1) {
    badges.push({
      id: "first-post",
      label: "First Post",
      description: "Created at least one post.",
      color: "slate",
    });
  }

  if (stats.postsCount >= 10) {
    badges.push({
      id: "builder",
      label: "Builder",
      description: "Published 10 or more posts.",
      color: "blue",
    });
  }

  if (stats.commentsCount >= 10) {
    badges.push({
      id: "discussant",
      label: "Discussant",
      description: "Wrote 10 or more comments.",
      color: "green",
    });
  }

  if (stats.reputation >= 25) {
    badges.push({
      id: "trusted",
      label: "Trusted",
      description: "Reached 25 reputation points.",
      color: "amber",
    });
  }

  if (stats.reputation >= 100) {
    badges.push({
      id: "top-contributor",
      label: "Top Contributor",
      description: "Reached 100 reputation points.",
      color: "violet",
    });
  }

  if (stats.memberDays >= 3) {
    badges.push({
      id: "regular",
      label: "Regular",
      description: "Member for at least 3 days.",
      color: "rose",
    });
  }

  return badges;
}

export function getPrimaryBadge(profile = {}) {
  const badges = getBadgesForProfile(profile);
  return badges[badges.length - 1] ?? null;
}
