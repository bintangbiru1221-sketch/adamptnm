import { NextResponse, NextRequest } from 'next/server'
import { google } from 'googleapis'

export async function GET(request: NextRequest) {
  // Log semua env vars yang relevan (untuk debug)
  console.log('=== GOOGLE OAUTH DEBUG INFO ===')
  console.log('GOOGLE_CLIENT_ID set:', !!process.env.GOOGLE_CLIENT_ID)
  console.log('GOOGLE_CLIENT_SECRET set:', !!process.env.GOOGLE_CLIENT_SECRET)
  console.log('NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL)
  
  // Dapatkan URL asal dari request untuk keandalan maksimal
  const requestUrl = new URL(request.url)
  const baseUrl = `${requestUrl.protocol}//${requestUrl.host}`
  console.log('Request base URL (from headers):', baseUrl)
  
  const redirectUri = `${baseUrl}/api/auth/google/callback`
  console.log('Final redirect URI being used:', redirectUri)

  // Dapatkan user ID dari query parameter
  const userId = requestUrl.searchParams.get('userId')
  if (!userId) {
    return NextResponse.redirect(`${baseUrl}/login?error=Please+login+first`)
  }

  // Validasi environment variables
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.error('Missing Google OAuth credentials!')
    return NextResponse.redirect(
      `${baseUrl}/sender-accounts?error=Missing+Google+configuration`
    )
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUri
  )

  const scopes = [
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
  ]

  // State: encode userId untuk dipassing ke callback
  const state = Buffer.from(userId).toString('base64')

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
    redirect_uri: redirectUri,
    state
  })

  console.log('\n✅ GOOGLE CLOUD CONSOLE SETUP:')
  console.log('================================')
  console.log('ADD THIS TO Authorized JavaScript origins:')
  console.log(baseUrl)
  console.log('\nADD THIS TO Authorized redirect URIs:')
  console.log(redirectUri)
  console.log('================================\n')
  console.log('Generated auth URL:', authUrl)

  return NextResponse.redirect(authUrl)
}
