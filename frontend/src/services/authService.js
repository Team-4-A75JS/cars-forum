import { supabase } from "../config/supabase-config";

function buildProfilePayload(user) {
    const metadata = user?.user_metadata ?? {};
    const fallbackUsername = `user_${String(user.id).slice(0, 8)}`;

    return {
        id: user.id,
        username: (metadata.username || fallbackUsername).trim(),
        first_name: (metadata.first_name || "First").trim(),
        last_name: (metadata.last_name || "Last").trim(),
    };
}

export async function ensureProfileForCurrentUser(user = null) {
    const authUser = user ?? (await supabase.auth.getUser()).data.user;
    if (!authUser) return null;

    const profilePayload = buildProfilePayload(authUser);

    let { error } = await supabase
        .from("profiles")
        .upsert(profilePayload, { onConflict: "id" });

    if (error && String(error.message).toLowerCase().includes("username")) {
        const fallbackPayload = {
            ...profilePayload,
            username: `user_${String(authUser.id).slice(0, 8)}`,
        };

        const retry = await supabase
            .from("profiles")
            .upsert(fallbackPayload, { onConflict: "id" });

        error = retry.error;
    }

    if (error) throw error;
    return authUser;
}

export async function registerUser({ email, password, username, firstName, lastName }) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                username,
                first_name: firstName,
                last_name: lastName,
            },
        },
    });

    if (error) throw error;

    try {
        await ensureProfileForCurrentUser(data?.user ?? null);
    } catch (profileError) {
        console.warn("Profile sync failed after register:", profileError.message);
    }

    return data;
}

export async function loginUser({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) throw error;

    try {
        await ensureProfileForCurrentUser(data?.user ?? null);
    } catch (profileError) {
        console.warn("Profile sync failed after login:", profileError.message);
    }

    return data;
}

export async function logoutUser() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
}

export async function getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) return null;
    return data?.session ?? null;
    // if (error) throw error;
    // return data.session;
} 
