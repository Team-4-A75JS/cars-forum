import { supabase } from "../config/supabase-config";

export async function getAllUsers(searchTerm = "") {                                                  // Get all users (with optional search)
    let query = supabase
        .from("profiles")
        .select("id, username, first_name, last_name, role, is_blocked");

    if (searchTerm.trim()) {
        query = query.or(
            `username.ilike.%${searchTerm}%,first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`
        );
    }

    const { data, error } = await query;

    if (error) throw error;
    return data ?? [];
}

export async function updateUserBlockStatus(userId, blocked) {                                       // Block / Unblock user
    const { error } = await supabase
        .from("profiles")
        .update({ is_blocked: blocked })
        .eq("id", userId);

    if (error) throw error;
}

export async function adminGetAllPosts() {                                                                //  Get all posts
    const { data, error } = await supabase
        .from("posts")
        .select("id, title, author_id, created_at, tags")
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data ?? [];
}

export async function deletePostByAdmin(postId) {                                                   // Delete post (admin)
    const { error } = await supabase
        .from("posts")
        .delete()
        .eq("id", postId);

    if (error) throw error;
}