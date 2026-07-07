import { NextResponse, NextRequest } from 'next/server'
import { google } from 'googleapis'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { senderAccountId, to, subject, body: emailBody } = body

    if (!senderAccountId || !to || !subject || !emailBody) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Dapatkan akun sender dari Supabase
    const { data: senderAccount, error: accountError } = await supabase
      .from('sender_accounts')
      .select('*')
      .eq('id', senderAccountId)
      .single()

    if (accountError || !senderAccount) {
      return NextResponse.json({ error: 'Sender account not found' }, { status: 404 })
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/api/auth/google/callback`
    )

    oauth2Client.setCredentials({
      access_token: senderAccount.access_token,
      refresh_token: senderAccount.refresh_token,
      expiry_date: senderAccount.token_expiry
    })

    // Refresh token jika perlu
    if (senderAccount.token_expiry && Date.now() > senderAccount.token_expiry) {
      const { credentials } = await oauth2Client.refreshAccessToken()
      oauth2Client.setCredentials(credentials)

      // Update token di Supabase
      await supabase
        .from('sender_accounts')
        .update({
          access_token: credentials.access_token,
          token_expiry: credentials.expiry_date
        })
        .eq('id', senderAccountId)
    }

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client })

    // Buat email message
    const message = [
      `To: ${to}`,
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=utf-8',
      '',
      emailBody
    ].join('\n')

    const encodedMessage = Buffer.from(message).toString('base64url')

    const result = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage
      }
    })

    return NextResponse.json({ success: true, messageId: result.data.id })
  } catch (error) {
    console.error('Error sending email:', error)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
