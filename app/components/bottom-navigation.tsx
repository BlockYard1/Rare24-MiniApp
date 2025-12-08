"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Plus, Tags, Home, Search, User } from "lucide-react"

const username = "Caleb"

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
    href: `/profile/${username}`,
    icon: User,
    label: "Profile",
  },
]

export default function BottomNavigation() {
  const pathname = usePathname()
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        // Scrolling down
        setIsVisible(false)
      } else {
        // Scrolling up
        setIsVisible(true)
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [lastScrollY])

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 border-t border-border bg-background transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "translate-y-full"
      }`}
    >
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