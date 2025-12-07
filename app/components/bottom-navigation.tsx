"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Plus, Tags, Home, Search, User } from "lucide-react"
import { useFarcasterStore } from "../store/useFarcasterStore"

const username = "Caleb";

export default function BottomNavigation() {
  const pathname = usePathname()
  const user = useFarcasterStore((state) => state.user)

  const navItems = [
    {
      href: "/uploadNft",
      icon: Plus,
      label: "Add",
    },
    {
      href: "/marketplace",
      icon: Tags,
      label: "Notifications",
    },
    {
      href: "/",
      icon: Home,
      label: "Home",
    },
    {
      href: "/search",
      icon: Search,
      label: "Search",
    },
    {
      href: `/profile/${user ? user.username : 'NaN'}`,
      icon: User,
      label: "Profile",
    },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-border bg-background">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto sm:max-w-none">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center justify-center w-12 h-12 rounded-full transition-colors
                ${isActive ? "bg-teal-500/50" : "text-muted-foreground hover:text-foreground"}
              `}
              aria-label={item.label}
            >
              <Icon className="w-7 h-7" />
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
