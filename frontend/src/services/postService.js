import { supabase } from "../config/supabase-config";
import { ensureProfileForCurrentUser } from "./authService";

function mapPost(postRow, likes = 0, commentsCount = 0) {
  return {
    id: postRow.id,
    title: postRow.title,
    content: postRow.content,
    author: postRow.profiles?.username ?? "Unknown",
    tags: "",
    likes,
    commentsCount,
    createdAt: postRow.created_at,
  };
}

function mapComment(commentRow) {
  return {
    id: commentRow.id,
    author: commentRow.profiles?.username ?? "Unknown",
    text: commentRow.content,
    createdAt: commentRow.created_at,
    postId: commentRow.post_id,
    parentCommentId: commentRow.parent_comment_id,
  };
}

async function getAuthenticatedUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!data.user) throw new Error("You must be logged in.");

  await ensureProfileForCurrentUser(data.user);
  return data.user;
}

async function buildPostStats(postIds) {
  if (postIds.length === 0) {
    return { likesByPostId: {}, commentsByPostId: {} };
  }

  const [{ data: voteRows, error: votesError }, { data: commentRows, error: commentsError }] =
    await Promise.all([
      supabase
        .from("votes")
        .select("post_id")
        .in("post_id", postIds)
        .is("comment_id", null)
        .eq("vote_type", 1),
      supabase
        .from("comments")
        .select("post_id")
        .in("post_id", postIds),
    ]);

  if (votesError) throw votesError;
  if (commentsError) throw commentsError;

  const likesByPostId = {};
  for (const vote of voteRows ?? []) {
    likesByPostId[vote.post_id] = (likesByPostId[vote.post_id] ?? 0) + 1;
  }

  const commentsByPostId = {};
  for (const comment of commentRows ?? []) {
    commentsByPostId[comment.post_id] = (commentsByPostId[comment.post_id] ?? 0) + 1;
  }

  return { likesByPostId, commentsByPostId };
}

export async function getAllPosts() {
  const { data: posts, error } = await supabase
    .from("posts")
    .select("id, title, content, created_at, profiles(username)")
    .order("created_at", { ascending: false });

  if (error) throw error;

  const postIds = (posts ?? []).map((post) => post.id);
  const { likesByPostId, commentsByPostId } = await buildPostStats(postIds);

  return (posts ?? []).map((post) =>
    mapPost(post, likesByPostId[post.id] ?? 0, commentsByPostId[post.id] ?? 0)
  );
}

export async function getPostById(postId) {
  const { data: post, error } = await supabase
    .from("posts")
    .select("id, title, content, created_at, profiles(username)")
    .eq("id", postId)
    .maybeSingle();

  if (error) throw error;
  if (!post) return null;

  const [{ count: likesCount, error: likesError }, { count: commentsCount, error: commentsError }] =
    await Promise.all([
      supabase
        .from("votes")
        .select("*", { count: "exact", head: true })
        .eq("post_id", postId)
        .is("comment_id", null)
        .eq("vote_type", 1),
      supabase
        .from("comments")
        .select("*", { count: "exact", head: true })
        .eq("post_id", postId),
    ]);

  if (likesError) throw likesError;
  if (commentsError) throw commentsError;

  return mapPost(post, likesCount ?? 0, commentsCount ?? 0);
}

export async function getCommentsByPostId(postId) {
  const { data: comments, error } = await supabase
    .from("comments")
    .select("id, post_id, parent_comment_id, content, created_at, profiles(username)")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (comments ?? []).map(mapComment);
}

export async function addComment(postId, text, parentCommentId = null) {
  const trimmedText = text.trim();
  if (!trimmedText) throw new Error("Comment cannot be empty.");

  const user = await getAuthenticatedUser();
  const { data: newComment, error } = await supabase
    .from("comments")
    .insert({
      post_id: postId,
      author_id: user.id,
      parent_comment_id: parentCommentId,
      content: trimmedText,
    })
    .select("id, post_id, parent_comment_id, content, created_at, profiles(username)")
    .single();

  if (error) throw error;
  return mapComment(newComment);
}

export async function addPost(newPost) {
  const title = newPost.title?.trim();
  const content = newPost.content?.trim();

  if (!title || !content) {
    throw new Error("Title and content are required.");
  }

  const user = await getAuthenticatedUser();
  const { data: post, error } = await supabase
    .from("posts")
    .insert({
      author_id: user.id,
      title,
      content,
    })
    .select("id")
    .single();

  if (error) throw error;
  return post.id;
}

export async function deletePost(postId) {
  const { error } = await supabase
    .from("posts")
    .delete()
    .eq("id", postId);

  if (error) throw error;
}

export async function likePost(postId) {
  const user = await getAuthenticatedUser();
  const { data: existingVotes, error: existingVotesError } = await supabase
    .from("votes")
    .select("id")
    .eq("user_id", user.id)
    .eq("post_id", postId)
    .is("comment_id", null);

  if (existingVotesError) throw existingVotesError;

  const alreadyLiked = (existingVotes ?? []).length > 0;

  if (alreadyLiked) {
    const { error } = await supabase
      .from("votes")
      .delete()
      .eq("user_id", user.id)
      .eq("post_id", postId)
      .is("comment_id", null);

    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("votes")
      .insert({
        user_id: user.id,
        post_id: postId,
        vote_type: 1,
      });

    if (error) throw error;
  }

  const { count, error: countError } = await supabase
    .from("votes")
    .select("*", { count: "exact", head: true })
    .eq("post_id", postId)
    .is("comment_id", null)
    .eq("vote_type", 1);

  if (countError) throw countError;

  return {
    liked: !alreadyLiked,
    likes: count ?? 0,
  };
}
