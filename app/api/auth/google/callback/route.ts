import { NextResponse, NextRequest } from 'next/server'
import { google } from 'googleapis'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/api/auth/google/callback`
)

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect('/sender-accounts?error=No authorization code')
  }

  try {
    const { tokens } = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens)

    const oauth2 = google.oauth2({ auth: oauth2Client, version: 'v2' })
    const userInfo = await oauth2.userinfo.get()
    const email = userInfo.data.email

    if (!email) {
      return NextResponse.redirect('/sender-accounts?error=Email not found')
    }

    // Dapatkan user dari Supabase Auth
    const { data: { session } } = await supabase.auth.getSession()

    if (!session?.user) {
      return NextResponse.redirect('/login?error=Please login first')
    }

    // Simpan akun sender ke Supabase
    const { error } = await supabase
      .from('sender_accounts')
      .upsert(
        {
          user_id: session.user.id,
          email,
          status: 'Connected',
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          token_expiry: tokens.expiry_date
        },
        { onConflict: 'email' }
      )

    if (error) {
      return NextResponse.redirect('/sender-accounts?error=' + encodeURIComponent(error.message))
    }

    return NextResponse.redirect('/sender-accounts?success=Account connected successfully')
  } catch (error) {
    console.error('Error getting tokens:', error)
    return NextResponse.redirect('/sender-accounts?error=Failed to connect account')
  }
}
