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