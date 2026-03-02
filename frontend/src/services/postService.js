import { supabase } from "../config/supabase-config";
import { ensureProfileForCurrentUser } from "./authService";
const POST_IMAGE_BUCKET = "post-images";

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

  const [
    { data: voteRows, error: votesError },
    { data: commentRows, error: commentsError },
  ] = await Promise.all([
    supabase
      .from("votes")
      .select("post_id")
      .in("post_id", postIds)
      .is("comment_id", null)
      .eq("vote_type", 1),
    supabase.from("comments").select("post_id").in("post_id", postIds),
  ]);

  if (votesError) throw votesError;
  if (commentsError) throw commentsError;

  const likesByPostId = {};
  for (const vote of voteRows ?? []) {
    likesByPostId[vote.post_id] = (likesByPostId[vote.post_id] ?? 0) + 1;
  }

  const commentsByPostId = {};
  for (const comment of commentRows ?? []) {
    commentsByPostId[comment.post_id] =
      (commentsByPostId[comment.post_id] ?? 0) + 1;
  }

  return { likesByPostId, commentsByPostId };
}

async function buildUserVotes(postIds) {
  if (postIds.length === 0) {
    return {};
  }

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    return {};
  }

  const { data: votes, error } = await supabase
    .from("votes")
    .select("post_id, vote_type")
    .eq("user_id", authData.user.id)
    .in("post_id", postIds)
    .is("comment_id", null);

  if (error) throw error;

  return Object.fromEntries(
    (votes ?? []).map((vote) => [vote.post_id, vote.vote_type]),
  );
}

function getFileExtension(fileName = "") {
  const segments = fileName.split(".");
  return segments.length > 1 ? segments.pop()?.toLowerCase() ?? "jpg" : "jpg";
}

function buildImagePath(userId, file) {
  const safeExtension = getFileExtension(file.name).replace(/[^a-z0-9]/g, "") || "jpg";
  const uniqueId =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  return `${userId}/${uniqueId}.${safeExtension}`;
}

function mapPostRecord(post, options = {}) {
  const {
    author = post.profiles?.username ?? "Unknown",
    authorAvatar = post.profiles?.avatar_url ?? null,
    authorRole = post.profiles?.role ?? "user",
    likes = 0,
    commentsCount = 0,
    userVote = 0,
    // allow passing complete profile for downstream components
    profile = post.profiles || {},
  } = options;

  return {
    id: post.id,
    title: post.title,
    content: post.content,
    author,
    authorAvatar,
    authorId: post.author_id,
    authorRole,
    tags: post.tags && post.tags.trim().length > 0 ? post.tags : "",
    imageUrl: post.image_url ?? "",
    likes,
    commentsCount,
    userVote,
    createdAt: post.created_at,
  };
}

export async function getAllPosts() {
  // include additional profile fields that may be used for badges or reputation
  const { data: posts, error: postsError } = await supabase
    .from("posts")
    .select(
      "*, profiles(username, created_at, avatar_url, reputation, posts_count, comments_count)"
    )
    .order("created_at", { ascending: false });

  if (postsError) throw postsError;
  if (!posts || posts.length === 0) return [];

  const postIds = posts.map((post) => post.id);
  const [{ likesByPostId, commentsByPostId }, userVotesByPostId] =
    await Promise.all([buildPostStats(postIds), buildUserVotes(postIds)]);

  return posts.map((post) =>
    mapPostRecord(post, {
      likes: likesByPostId[post.id] ?? 0,
      commentsCount: commentsByPostId[post.id] ?? 0,
      userVote: userVotesByPostId[post.id] ?? 0,
    }),
  );
}

export async function getPostById(postId) {
  const { data: post, error: postError } = await supabase
    .from("posts")
    .select("*, profiles(username, role, reputation, posts_count, comments_count, created_at)")
    .eq("id", postId)
    .maybeSingle();

  if (postError) throw postError;
  if (!post) return null;

  // profiles returned by the previous query already include the needed fields,
  // but we'll keep this lookup for backward compatibility. It now fetches extras too.
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("username, role, reputation, posts_count, comments_count, created_at")
    .eq("id", post.author_id)
    .maybeSingle();

  if (profileError) throw profileError;
  const [
    { count: likes, error: likesError },
    { count: commentsCount, error: commentsError },
  ] = await Promise.all([
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

  return mapPostRecord(post, {
    author: profile?.username ?? "Unknown",
    authorRole: profile?.role ?? "user",
    likes,
    commentsCount,
  });
}

export async function getCommentsByPostId(postId) {
  const { data: comments, error } = await supabase
    .from("comments")
    .select("*, profiles(username, role)")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  if (!comments || comments.length === 0) return [];

  return comments.map((comment) => ({
    id: comment.id,
    author: comment.profiles?.username ?? "Unknown",
    authorId: comment.author_id,
    text: comment.content,
    createdAt: comment.created_at,
    postId: comment.post_id,
    parentCommentId: comment.parent_comment_id,
  }));
}

export async function deleteComment(commentId) {
  const { error } = await supabase.from("comments").delete().eq("id", commentId);

  if (error) throw error;
  return true;
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
    .select("*")
    .single();

  if (error) throw error;

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", newComment.author_id)
    .maybeSingle();

  return {
    id: newComment.id,
    author: profile?.username ?? "Unknown",
    text: newComment.content,
    createdAt: newComment.created_at,
    postId: newComment.post_id,
    parentCommentId: newComment.parent_comment_id,
  };
}

export async function uploadPostImage(file) {
  if (!file) return null;
  if (!file.type.startsWith("image/")) {
    throw new Error("Only image files are allowed.");
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Image size must be 5MB or less.");
  }

  const user = await getAuthenticatedUser();
  const storagePath = buildImagePath(user.id, file);

  const { error: uploadError } = await supabase.storage
    .from(POST_IMAGE_BUCKET)
    .upload(storagePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Failed to upload image: ${uploadError.message}`);
  }

  const { data } = supabase.storage
    .from(POST_IMAGE_BUCKET)
    .getPublicUrl(storagePath);

  return {
    path: storagePath,
    publicUrl: data.publicUrl,
  };
}

export async function addPost(newPost) {
  const title = newPost.title?.trim();
  const content = newPost.content?.trim();
  const tags = newPost.tags?.trim() || "";
  const imageUrl = newPost.imageUrl?.trim() || null;

  if (!title || !content) {
    throw new Error("Title and content are required.");
  }

  let user;
  try {
    user = await getAuthenticatedUser();
  } catch (authErr) {
    throw new Error(`Auth failed: ${authErr.message}`);
  }

  const { data: post, error } = await supabase
    .from("posts")
    .insert({
      author_id: user.id,
      title,
      content,
      tags,
      image_url: imageUrl,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(`Failed to create post: ${error.message}`);
  }

  return post.id;
}

export async function deletePost(postId) {
  const { error } = await supabase.from("posts").delete().eq("id", postId);
  if (error) throw error;
}

export async function updatePost(postId, updates) {
  const dataToUpdate = {};

  if (updates.title !== undefined) dataToUpdate.title = updates.title.trim();
  if (updates.content !== undefined) {
    dataToUpdate.content = updates.content.trim();
  }
  if (updates.tags !== undefined) dataToUpdate.tags = updates.tags.trim();
  if (updates.imageUrl !== undefined) {
    dataToUpdate.image_url = updates.imageUrl?.trim() || null;
  }

  const { data, error } = await supabase
    .from("posts")
    .update(dataToUpdate)
    .eq("id", postId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function getPostLikesCount(postId) {
  const { count, error } = await supabase
    .from("votes")
    .select("*", { count: "exact", head: true })
    .eq("post_id", postId)
    .is("comment_id", null)
    .eq("vote_type", 1);

  if (error) throw error;
  return count ?? 0;
}

export async function votePost(postId, voteType) {
  if (![1, -1].includes(voteType)) {
    throw new Error("Invalid vote type.");
  }

  const user = await getAuthenticatedUser();

  const { data: existingVote, error: existingVoteError } = await supabase
    .from("votes")
    .select("id, vote_type")
    .eq("user_id", user.id)
    .eq("post_id", postId)
    .is("comment_id", null)
    .maybeSingle();

  if (existingVoteError) throw existingVoteError;

  if (!existingVote) {
    const { error } = await supabase.from("votes").insert({
      user_id: user.id,
      post_id: postId,
      vote_type: voteType,
    });

    if (error) throw error;
  } else if (existingVote.vote_type === voteType) {
    const { error } = await supabase
      .from("votes")
      .delete()
      .eq("id", existingVote.id);

    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("votes")
      .update({ vote_type: voteType })
      .eq("id", existingVote.id);

    if (error) throw error;
  }

  const likes = await getPostLikesCount(postId);

  return {
    vote: existingVote?.vote_type === voteType ? 0 : voteType,
    likes,
  };
}

export async function likePost(postId) {
  const result = await votePost(postId, 1);
  return {
    liked: result.vote === 1,
    likes: result.likes,
    vote: result.vote,
  };
}

export async function downvotePost(postId) {
  const result = await votePost(postId, -1);
  return {
    downvoted: result.vote === -1,
    likes: result.likes,
    vote: result.vote,
  };
}

export async function getUserPostVote(postId) {
  const user = await getAuthenticatedUser();
  const { data, error } = await supabase
    .from("votes")
    .select("vote_type")
    .eq("user_id", user.id)
    .eq("post_id", postId)
    .is("comment_id", null)
    .maybeSingle();

  if (error) throw error;
  return data?.vote_type ?? 0;
}

export async function userLikedPost(postId) {
  const vote = await getUserPostVote(postId);
  return vote === 1;
}
