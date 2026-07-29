import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = "https://uprqbdrjgzzlyjlqebxk.supabase.co";

const supabaseKey = "sb_publishable_4lgoXzNGjEV9PQ6IuCi_AQ_9J6DUY3l";

export const supabase = createClient(
    supabaseUrl,
    supabaseKey
);
