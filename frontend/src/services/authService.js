import { supabase } from "../../frontend/src/config/supabase-config";

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
