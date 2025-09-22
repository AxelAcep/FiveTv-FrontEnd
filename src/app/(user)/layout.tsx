// app/layout.tsx
import type { Metadata } from "next"
import "../global.css"
import Header from "@/components/Header" // Pastikan path-nya benar
import Footer from "@/components/Footer" // Pastikan path-nya benar

export const metadata: Metadata = {
  title: "Five Tv",
  description: "Example with global layout",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700&display=swap" rel="stylesheet"/>
      </head>
      <body>
        {/* Header */}
        <Header />

        {/* Main Content */}
        <main style={{  }}>{children}</main>

        {/* Footer */}
        <Footer />
      </body>
    </html>
  )
}