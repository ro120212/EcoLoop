import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://cxhqjmrxtlfrthuboaij.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4aHFqbXJ4dGxmcnRodWJvYWlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA0MDQ2NzksImV4cCI6MjEwNTk4MDY3OX0.3Jy1fMOpVts_hPfwoRFykyUQ306cbfGDtUJk5zsb70k'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
