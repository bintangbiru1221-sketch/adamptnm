import { NextResponse, NextRequest } from 'next/server'
import { google } from 'googleapis'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const baseUrl = `${requestUrl.protocol}//${requestUrl.host}`
  
  const userId = requestUrl.searchParams.get('userId')
  if (!userId) {
    return NextResponse.redirect(`${baseUrl}/login?error=Please+login+first`)
  }

  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return NextResponse.redirect(
      `${baseUrl}/sender-accounts?error=Missing+Google+configuration`
    )
  }

  const redirectUri = `${baseUrl}/api/auth/google/callback`
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

  const state = Buffer.from(userId).toString('base64')
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
    redirect_uri: redirectUri,
    state
  })

  return NextResponse.redirect(authUrl)
}
