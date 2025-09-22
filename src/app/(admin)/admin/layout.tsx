// app/layout.tsx
import type { Metadata } from "next"
import "../../global.css"

export const metadata: Metadata = {
  title: "Admin Five Tv",
  description: "Example with global layout",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700&display=swap" rel="stylesheet"/>
      </head>
      <body>


        {/* Main Content */}
        <main style={{  }}>{children}</main>


      </body>
    </html>
  )
}