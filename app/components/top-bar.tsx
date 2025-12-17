"use client"

import Link from "next/link"
import { useEffect } from "react"
import { Raleway } from "next/font/google"
import { Bell, Wallet } from "lucide-react"
import { useConnection, useConnectors, useConnect } from 'wagmi'
import { useNotificationStore } from "../store/useFarcasterStore"
import { checkNotification } from "../blockchain/getterHooks"

const raleway = Raleway({ 
  weight: ['400'],
  subsets: ['latin'],
  variable: '--font-raleway',
})

export default function TopBar() {
  const { isConnected, address } = useConnection()
  const { setNotify, setLoading, notify, loading } = useNotificationStore()
  const connectors = useConnectors()
  const { connect } = useConnect()

  console.log(`address>: ${address} ${isConnected}`)

  useEffect(() => {
    try {
      const fetchData = async() => {
        setLoading(true)

        const data = await checkNotification(address as `0x${string}`)
        if(data)
          setNotify(data)
      }
      fetchData()
    } catch(error) {
      console.error('Error loading Notifications:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 border-b-1 dark:border-gray-600 border-border bg-background z-50">
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
            {
              (notify?.length ?? 0) > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-5 h-5 px-1 bg-red-500 text-white text-xs font-semibold rounded-full">
                  {(notify?.length ?? 0) > 9 ? '9+' : notify?.length}
                </span>
              )
            }
          </Link>
          {
            !address && (
              <button 
                onClick={() => connect({ connector: connectors[0] })}
                disabled={isConnected}
                className={``}
              >
                <Wallet className={``} size={30} />
              </button>
            ) 
          }
        </div>
      </div>
    </header>
  )
}
