import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://nwgycevpryyoytdkwfkp.supabase.co";
const supabaseKey = "sb_publishable_xITfAQoCWgdrJRKGtvNL2Q_YCNySFxe";

export const supabase = createClient(supabaseUrl, supabaseKey)