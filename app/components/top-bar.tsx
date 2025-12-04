"use client"

import Link from "next/link"
import { Raleway } from "next/font/google"
import { Bell, Wallet } from "lucide-react"
import { useConnection, useConnectors, useConnect } from 'wagmi'

const raleway = Raleway({ 
  weight: ['400'],
  subsets: ['latin'],
  variable: '--font-raleway',
})

export default function TopBar() {
  const { isConnected, address } = useConnection()
  const connectors = useConnectors()
  const { connect } = useConnect()

  console.log(`address: ${address} ${isConnected}`)

  return (
    <header className="fixed top-0 left-0 right-0 border-b border-border bg-background z-50">
      <div className="flex items-center justify-between h-16 px-4 max-w-md mx-auto sm:max-w-none sm:px-6">
        {/* Logo/Brand */}
        <h1 className={`text-2xl text-foreground ${raleway.variable}`} style={{ fontWeight: 400 }}>rare24</h1>

        {/* Notification Bell */}
        <div className={`flex items-center justify-between gap-2`}>
          <Link
            href="/notifications"
            className="relative flex items-center justify-center w-10 h-10 rounded-lg hover:bg-muted transition-colors"
            aria-label="Notifications"
          >
            <Bell className="text-foreground" size={30} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
          </Link>
          <button 
            onClick={() => connect({ connector: connectors[0] })}
            disabled={isConnected}
            className={`${isConnected ? "text-green-500/50" : "text-red-500/50"}`}
          >
            <Wallet className={``} size={30} />
          </button>
        </div>
      </div>
    </header>
  )
}
