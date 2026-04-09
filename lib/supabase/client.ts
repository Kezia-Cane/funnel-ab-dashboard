import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Public client – for browser-safe operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server client – uses service role key, only use in API routes / server actions
export function createServerClient() {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) {
        // Fall back to anon key in development
        return createClient(supabaseUrl, supabaseAnonKey)
    }
    return createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false }
    })
}
