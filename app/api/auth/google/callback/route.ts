import { NextResponse, NextRequest } from 'next/server'
import { google } from 'googleapis'
import { createClient } from '@supabase/supabase-js'

// Gunakan Service Role Key untuk write akses penuh di server
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables')
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const baseUrl = `${requestUrl.protocol}//${requestUrl.host}`
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')

  if (!code || !state) {
    return NextResponse.redirect(`${baseUrl}/sender-accounts?error=No+authorization+code+or+state`)
  }

  try {
    // Decode state untuk mendapatkan userId
    const userId = Buffer.from(state, 'base64').toString('utf-8')
    if (!userId) {
      return NextResponse.redirect(`${baseUrl}/sender-accounts?error=Invalid+state`)
    }

    // Buat OAuth client dengan redirect URI yang sesuai request
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${baseUrl}/api/auth/google/callback`
    )

    const { tokens } = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens)

    const oauth2 = google.oauth2({ auth: oauth2Client, version: 'v2' })
    const userInfo = await oauth2.userinfo.get()
    const email = userInfo.data.email

    if (!email) {
      return NextResponse.redirect(`${baseUrl}/sender-accounts?error=Email+not+found`)
    }

    // Simpan akun sender ke Supabase
    const { error } = await supabase
      .from('sender_accounts')
      .upsert(
        {
          user_id: userId,
          email,
          status: 'Connected',
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          token_expiry: tokens.expiry_date
        },
        { onConflict: 'email' }
      )

    if (error) {
      return NextResponse.redirect(`${baseUrl}/sender-accounts?error=${encodeURIComponent(error.message)}`)
    }

    return NextResponse.redirect(`${baseUrl}/sender-accounts?success=Account+connected+successfully`)
  } catch (error) {
    console.error('Error getting tokens:', error)
    return NextResponse.redirect(`${baseUrl}/sender-accounts?error=Failed+to+connect+account`)
  }
}
