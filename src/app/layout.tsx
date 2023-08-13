import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Inside Gov Search',
  description: '自然言語入力で知りたい届出や手続きを検索します',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body suppressHydrationWarning={true}>
        <main>{children}</main>
      </body>
    </html>
  )
}
