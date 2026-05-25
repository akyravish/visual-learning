import { Geist, JetBrains_Mono } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import { MainNav } from "@/components/navigation/mainNav.component"
import { Separator } from "@/components/ui/separator"

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontSans.variable,
        "font-mono",
        jetbrainsMono.variable
      )}
    >
      <body className="flex min-h-screen flex-col">
        <MainNav />
        <Separator />
        <ThemeProvider>
          <div className="flex flex-1 flex-col">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  )
}
