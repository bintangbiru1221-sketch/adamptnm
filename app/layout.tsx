import './globals.css'
import type { Metadata } from 'next'
import { AppProvider } from '@/lib/context'
import ClientLayout from './client-layout'

export const metadata: Metadata = {
  title: 'Multi Gmail Wetan',
  description: 'Kirim email broadcast bertahap menggunakan Gmail Anda sendiri.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="font-body bg-canvas text-ink">
        <AppProvider>
          <ClientLayout>{children}</ClientLayout>
        </AppProvider>
      </body>
    </html>
  )
}
