import { supabase } from "../config/supabase-config";

function createEmptyStats() {
  return {
    reputation: 0,
    postsCount: 0,
    commentsCount: 0,
  };
}

function addReputationFromVote(stats, voteType, valuePerVote) {
  if (!stats) return;

  if (voteType === 1) {
    stats.reputation += valuePerVote;
  } else if (voteType === -1) {
    stats.reputation -= valuePerVote;
  }
}

export async function getProfileStatsByIds(userIds) {
  const uniqueIds = [...new Set((userIds ?? []).filter(Boolean))];
  if (uniqueIds.length === 0) return {};

  const statsByUserId = Object.fromEntries(
    uniqueIds.map((id) => [id, createEmptyStats()]),
  );

  const [
    { data: posts, error: postsError },
    { data: comments, error: commentsError },
  ] = await Promise.all([
    supabase.from("posts").select("id, author_id").in("author_id", uniqueIds),
    supabase
      .from("comments")
      .select("id, author_id")
      .in("author_id", uniqueIds),
  ]);

  if (postsError) throw postsError;
  if (commentsError) throw commentsError;

  const postAuthorById = {};
  for (const post of posts ?? []) {
    postAuthorById[post.id] = post.author_id;
    statsByUserId[post.author_id].postsCount += 1;
  }

  const commentAuthorById = {};
  for (const comment of comments ?? []) {
    commentAuthorById[comment.id] = comment.author_id;
    statsByUserId[comment.author_id].commentsCount += 1;
  }

  const postIds = Object.keys(postAuthorById);
  const commentIds = Object.keys(commentAuthorById);

  const [
    { data: postVotes, error: postVotesError },
    { data: commentVotes, error: commentVotesError },
  ] = await Promise.all([
    postIds.length > 0
      ? supabase
          .from("votes")
          .select("post_id, vote_type")
          .in("post_id", postIds)
          .is("comment_id", null)
      : Promise.resolve({ data: [], error: null }),
    commentIds.length > 0
      ? supabase
          .from("votes")
          .select("comment_id, vote_type")
          .in("comment_id", commentIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (postVotesError) throw postVotesError;
  if (commentVotesError) throw commentVotesError;

  for (const vote of postVotes ?? []) {
    addReputationFromVote(statsByUserId[postAuthorById[vote.post_id]], vote.vote_type, 5);
  }

  for (const vote of commentVotes ?? []) {
    addReputationFromVote(
      statsByUserId[commentAuthorById[vote.comment_id]],
      vote.vote_type,
      2,
    );
  }

  return statsByUserId;
}

export async function getProfileStatsById(userId) {
  const statsByUserId = await getProfileStatsByIds([userId]);
  return statsByUserId[userId] ?? createEmptyStats();
}
