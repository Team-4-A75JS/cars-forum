import { supabase } from "../config/supabase-config";
import { getProfileStatsById } from "./reputationService";

export async function getMyProfile() {
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr) throw userErr;

    const user = userData?.user;
    if (!user) return null;

    const { data, error } = await supabase
        .from("profiles")
        .select("id, username, first_name, last_name, role, is_blocked, created_at, avatar_url")
        .eq("id", user.id)
        .single();

    if (error) throw error;

    const stats = await getProfileStatsById(user.id);
    return { ...data, ...stats };
}

export async function updateMyProfile({ username, first_name, last_name, avatar_url }) {
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr) throw userErr;

    const user = userData?.user;
    if (!user) throw new Error("You must be logged in.");

    const payload = {
        username: username?.trim(),
        first_name: first_name?.trim(),
        last_name: last_name?.trim(),
        ...(avatar_url !== undefined ? { avatar_url } : {}),
    };

    const { data, error } = await supabase
        .from("profiles")
        .update(payload)
        .eq("id", user.id)
        .select("id, username, first_name, last_name, role, is_blocked, created_at, avatar_url")
        .single();

    if (error) throw error;

    const stats = await getProfileStatsById(user.id);
    return { ...data, ...stats };
}
