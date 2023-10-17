import type { Metadata } from 'next'
import { flex, grid } from '../../styled-system/patterns'
import './globals.css'

const title = '練馬区 窓口・手続きガイド'
const description = '自然言語入力で行きたい窓口や手続きを案内します'
const imgUrl = 'https://guide.code4nerima.org/images/og.png'

export const metadata: Metadata = {
  title: title,
  description: description,
  openGraph: {
    title: title,
    description: description,
    url: 'https://guide.code4nerima.org/',
    siteName: title,
    images: [
      {
        url: imgUrl,
        width: 1200,
        height: 630,
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: title,
    description: description,
    images: [imgUrl],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon.png" />
        <meta name="theme-color" content="#4DA635" />
      </head>
      <body suppressHydrationWarning={true}>
        <div
          className={grid({
            columns: 1,
            gridTemplateRows: 'auto min-content',
            gap: '0',
            minHeight: '100dvh',
          })}
        >
          <main
            className={flex({
              direction: 'column',
              flex: '1 0 100%',
            })}
          >
            {children}
          </main>
          <footer
            className={flex({
              justify: 'center',
              align: 'center',
              backgroundColor: 'nerimaDark',
              color: 'white',
              padding: '4px 18px',
            })}
          >
            <small>&copy; Code for Nerima 2023</small>
          </footer>
        </div>
      </body>
    </html>
  )
}
