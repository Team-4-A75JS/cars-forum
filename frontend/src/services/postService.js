import { supabase } from "../config/supabase-config";
// import { ensureProfileForCurrentUser } from "./authService";



async function getAuthenticatedUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!data.user) throw new Error("You must be logged in.");

  // await ensureProfileForCurrentUser(data.user);
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
  try {
    console.log("Fetching all posts...");
    
    // First, try to fetch posts without the profile join
    const { data: posts, error: postsError } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (postsError) {
      console.error("Posts fetch error:", postsError);
      throw postsError;
    }

    console.log("Raw posts data:", posts);

    if (!posts || posts.length === 0) {
      console.log("No posts found in database");
      return [];
    }

    // Now fetch author profiles separately
    const authorIds = [...new Set(posts.map(p => p.author_id))];
    console.log("Fetching profiles for authors:", authorIds);

    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, username")
      .in("id", authorIds);

    if (profilesError) {
      console.warn("Profiles fetch warning (continuing without usernames):", profilesError);
    }

    const profilesMap = {};
    (profiles ?? []).forEach(p => {
      profilesMap[p.id] = p.username;
    });

    const postIds = posts.map((post) => post.id);
    const { likesByPostId, commentsByPostId } = await buildPostStats(postIds);

    const mappedPosts = posts.map((post) => ({
      id: post.id,
      title: post.title,
      content: post.content,
      author: profilesMap[post.author_id] ?? "Unknown",
      tags: post.tags && post.tags.trim().length > 0 ? post.tags : "",
      likes: likesByPostId[post.id] ?? 0,
      commentsCount: commentsByPostId[post.id] ?? 0,
      createdAt: post.created_at,
    }));

    console.log("Mapped posts with tags:", mappedPosts.map(p => ({ id: p.id, title: p.title, tags: p.tags })));
    return mappedPosts;
  } catch (err) {
    console.error("getAllPosts exception:", err);
    throw err;
  }
}

export async function getPostById(postId) {
  try {
    const { data: post, error: postError } = await supabase
      .from("posts")
      .select("*")
      .eq("id", postId)
      .maybeSingle();

    if (postError) {
      console.error("getPostById error:", postError);
      throw postError;
    }

    if (!post) return null;

    // Fetch author profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", post.author_id)
      .maybeSingle();

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

    return {
      id: post.id,
      title: post.title,
      content: post.content,
      author: profile?.username ?? "Unknown",
      tags: post.tags || "",
      likes: likesCount ?? 0,
      commentsCount: commentsCount ?? 0,
      createdAt: post.created_at,
    };
  } catch (err) {
    console.error("getPostById exception:", err);
    throw err;
  }
}

export async function getCommentsByPostId(postId) {
  try {
    const { data: comments, error } = await supabase
      .from("comments")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("getCommentsByPostId error:", error);
      throw error;
    }

    if (!comments || comments.length === 0) return [];

    // Fetch author profiles
    const authorIds = [...new Set(comments.map(c => c.author_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, username")
      .in("id", authorIds);

    const profilesMap = {};
    (profiles ?? []).forEach(p => {
      profilesMap[p.id] = p.username;
    });

    return comments.map(comment => ({
      id: comment.id,
      author: profilesMap[comment.author_id] ?? "Unknown",
      text: comment.content,
      createdAt: comment.created_at,
      postId: comment.post_id,
      parentCommentId: comment.parent_comment_id,
    }));
  } catch (err) {
    console.error("getCommentsByPostId exception:", err);
    throw err;
  }
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

  // Fetch the author profile
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

export async function addPost(newPost) {
  const title = newPost.title?.trim();
  const content = newPost.content?.trim();
  const tags = newPost.tags?.trim() || "";

  if (!title || !content) {
    throw new Error("Title and content are required.");
  }

  let user;
  try {
    user = await getAuthenticatedUser();
  } catch (authErr) {
    console.error("Authentication error:", authErr);
    throw new Error(`Auth failed: ${authErr.message}`);
  }

  console.log("Creating post with:", { title, content, tags, author_id: user.id });

  const { data: post, error } = await supabase
    .from("posts")
    .insert({
      author_id: user.id,
      title,
      content,
      tags,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Supabase insert error:", error);
    throw new Error(`Failed to create post: ${error.message}`);
  }
  return post.id;
}

export async function deletePost(postId) {
  const { error } = await supabase
    .from("posts")
    .delete()
    .eq("id", postId);

  if (error) throw error;
}

export async function updatePost(postId, updates) {
  const dataToUpdate = {};
  if (updates.title !== undefined) dataToUpdate.title = updates.title.trim();
  if (updates.content !== undefined) dataToUpdate.content = updates.content.trim();
  if (updates.tags !== undefined) dataToUpdate.tags = updates.tags.trim();

  const { data, error } = await supabase
    .from("posts")
    .update(dataToUpdate)
    .eq("id", postId)
    .select()
    .single();

  if (error) throw error;
  return data;
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

export async function userLikedPost(postId) {
  const user = await getAuthenticatedUser();
  const { data, error } = await supabase
    .from("votes")
    .select("id")
    .eq("user_id", user.id)
    .eq("post_id", postId)
    .is("comment_id", null)
    .eq("vote_type", 1);
  if (error) throw error;
  return (data ?? []).length > 0;
}
