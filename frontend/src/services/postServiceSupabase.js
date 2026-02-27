import { supabase } from "../lib/supabaseClient";

export async function fetchPosts() {
    const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching posts:", error);
        return [];
    }

    return data;
}

export async function createPost(post) {
    const { data: userData } = await supabase.auth.getUser();

    const user = userData.user;

    if (!user) {
        console.error("No logged in user");
        return null;
    }

    const { data, error } = await supabase
        .from("posts")
        .insert([
            {
                title: post.title,
                content: post.content,
                author_id: user.id,
            },
        ])
        .select();

    if (error) {
        console.error("Error creating post:", error);
        return null;
    }

    return data[0];
}

export async function fetchPostById(postId) {
    const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", postId)
        .single();

    if (error) {
        console.error("Error fetching post:", error);
        return null;
    }

    return data;
}