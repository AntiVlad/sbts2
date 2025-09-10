import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SBTS Clock in',
  description: 'Simple classroom attendance clock-in/clock-out app',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <div className="mx-auto max-w-5xl p-4 md:p-8">
          <header className="flex items-center justify-between py-4">
            <h1 className="text-2xl font-semibold">SBTS Clock in</h1>
            
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  )
}
