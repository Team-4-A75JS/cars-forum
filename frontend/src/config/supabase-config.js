import { createClient } from '@supabase/supabase-js';

// Replace these with your Supabase project URL and anon key
// You can ind these in your Supabase project settings
// const supabaseUrl = 'https://nwgycevpryyoytdkwfkp.supabase.co';
// const supabaseKey = 'sb_publishable_xITfAQoCWgdrJRKGtvNL2Q_YCNySFxe';

export const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);


