import { createClient } from "@supabase/supabase-js";

// ⚙️ Ces valeurs viendront du dashboard Supabase
const supabaseUrl = "https://yzqgnwkpdhkmfxujadks.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6cWdud2twZGhrbWZ4dWphZGtzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NDU5MDEsImV4cCI6MjA3NjAyMTkwMX0.Aef34go19dG7B0MRzMnVai_FYHqtib26B4y6LmioMOs"; // à remplacer

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
