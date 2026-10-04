// @ts-nocheck
import { createClient } from "@supabase/supabase-js";

const url = "https://zqvfgljmitaxgpmcgbbt.supabase.co";
const key = "sb_publishable_17uGYaUWAhw94pVcRTgGFQ_tzuWnWHv";

export const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
});
