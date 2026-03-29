import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { Providers } from '@/components/providers/Providers'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'K.S Futevôlei',
  description: 'App premium de gestão de futevôlei',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={`dark ${GeistSans.variable}`} suppressHydrationWarning>
      <body className="bg-graphite-900 text-white antialiased min-h-svh" suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
