"use client"

import Link from "next/link"
import { Raleway } from "next/font/google"
import { Bell } from "lucide-react"

const raleway = Raleway({ 
  weight: ['400'],
  subsets: ['latin'],
  variable: '--font-raleway',
})

export default function TopBar() {
  return (
    <header className="fixed top-0 left-0 right-0 border-b border-border bg-background z-50">
      <div className="flex items-center justify-between h-16 px-4 max-w-md mx-auto sm:max-w-none sm:px-6">
        {/* Logo/Brand */}
        <h1 className={`text-2xl text-foreground ${raleway.variable}`} style={{ fontWeight: 400 }}>rare24</h1>

        {/* Notification Bell */}
        <Link
          href="/notifications"
          className="relative flex items-center justify-center w-10 h-10 rounded-lg hover:bg-muted transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-7 h-7 text-foreground" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
        </Link>
      </div>
    </header>
  )
}
