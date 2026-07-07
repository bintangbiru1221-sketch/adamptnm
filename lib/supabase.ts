import { createClient } from '@supabase/supabase-js'

// Validasi URL adalah HTTP/HTTPS valid
function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return url.startsWith('http://') || url.startsWith('https://')
  } catch {
    return false
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

console.log('🔧 SUPABASE CONFIG:', {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey,
  urlIsValid: isValidUrl(supabaseUrl),
  url: supabaseUrl.substring(0, 30) + '...'
})

// Hanya buat client jika URL & Key tersedia dan valid
export const supabase = supabaseUrl && supabaseAnonKey && isValidUrl(supabaseUrl)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null
