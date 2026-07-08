import { NextResponse, NextRequest } from 'next/server'
import { google } from 'googleapis'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('=== GOOGLE OAUTH DEBUG INFO ===')
    console.log('GOOGLE_CLIENT_ID set:', !!process.env.GOOGLE_CLIENT_ID)
    console.log('GOOGLE_CLIENT_SECRET set:', !!process.env.GOOGLE_CLIENT_SECRET)
    console.log('NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL)
    
    const requestUrl = new URL(request.url)
    const baseUrl = `${requestUrl.protocol}//${requestUrl.host}`
    console.log('Request base URL (from headers):', baseUrl)
    
    const redirectUri = `${baseUrl}/api/auth/google/callback`
    console.log('Final redirect URI being used:', redirectUri)

    const userId = requestUrl.searchParams.get('userId')
    console.log('userId from query:', userId)
    if (!userId) {
      console.log('No userId found, redirecting to login')
      return NextResponse.redirect(`${baseUrl}/login?error=Please+login+first`)
    }

    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      console.error('Missing Google OAuth credentials!')
      return NextResponse.redirect(
        `${baseUrl}/sender-accounts?error=Missing+Google+configuration`
      )
    }

    console.log('Creating OAuth2 client...')
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

    console.log('Encoding state with userId:', userId)
    const state = Buffer.from(userId).toString('base64')
    console.log('Encoded state:', state)

    console.log('Generating auth URL...')
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
      redirect_uri: redirectUri,
      state
    })

    console.log('\nGOOGLE CLOUD CONSOLE SETUP:')
    console.log('================================')
    console.log('ADD THIS TO Authorized JavaScript origins:')
    console.log(baseUrl)
    console.log('\nADD THIS TO Authorized redirect URIs:')
    console.log(redirectUri)
    console.log('================================\n')
    console.log('Generated auth URL length:', authUrl.length)
    console.log('First 50 chars of auth URL:', authUrl.substring(0, 50))
    
    console.log('Redirecting to auth URL...')
    return NextResponse.redirect(authUrl)
  } catch (e) {
    console.error('ERROR IN GOOGLE OAUTH ROUTE:', e)
    const errorMessage = e instanceof Error ? e.message : 'Unknown error'
    console.error('Error message:', errorMessage)
    console.error('Error stack:', (e as Error).stack)
    const requestUrl = new URL(request.url)
    const baseUrl = `${requestUrl.protocol}//${requestUrl.host}`
    return NextResponse.redirect(`${baseUrl}/sender-accounts?error=${encodeURIComponent(errorMessage)}`)
  }
}
