import { supabase } from "../config/supabase-config";

export async function getMyProfile() {
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr) throw userErr;

    const user = userData?.user;
    if (!user) return null;

    const { data, error } = await supabase
        .from("profiles")
        .select("id, username, first_name, last_name, role, is_blocked")
        .eq("id", user.id)
        .single();

    if (error) throw error;
    return data;
}

export async function updateMyProfile({ username, first_name, last_name }) {
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr) throw userErr;

    const user = userData?.user;
    if (!user) throw new Error("You must be logged in.");

    const payload = {
        username: username?.trim(),
        first_name: first_name?.trim(),
        last_name: last_name?.trim(),
    };

    const { data, error } = await supabase
        .from("profiles")
        .update(payload)
        .eq("id", user.id)
        .select("id, username, first_name, last_name, role, is_blocked")
        .single();

    if (error) throw error;
    return data;
}