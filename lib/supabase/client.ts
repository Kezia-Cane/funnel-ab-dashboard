import { createClient } from '@supabase/supabase-js'

function getRequiredPublicEnv(
    name: 'NEXT_PUBLIC_SUPABASE_URL' | 'NEXT_PUBLIC_SUPABASE_ANON_KEY'
): string {
    const value = process.env[name]?.trim()

    if (!value) {
        throw new Error(`Missing environment variable: ${name}`)
    }

    return value
}

const supabaseUrl = getRequiredPublicEnv('NEXT_PUBLIC_SUPABASE_URL')
const supabaseAnonKey = getRequiredPublicEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')

// Public client – for browser-safe operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
