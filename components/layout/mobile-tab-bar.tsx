"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, FileText, List, Users, User } from "lucide-react"
import { cn } from "@/lib/utils"

const tabItems = [
  { href: "/", label: "홈", icon: Home },
  { href: "/issue", label: "발행", icon: FileText },
  { href: "/history", label: "내역", icon: List },
  { href: "/clients", label: "거래처", icon: Users },
  { href: "/mypage", label: "내 정보", icon: User },
]

export function MobileTabBar() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 z-50">
      <ul className="flex justify-around">
        {tabItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== "/" && pathname.startsWith(item.href))
          const Icon = item.icon

          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center min-h-[56px] py-2 transition-colors",
                  isActive
                    ? "text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className={cn(
                  "text-xs mt-1",
                  isActive ? "font-semibold" : "font-medium"
                )}>
                  {item.label}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
      {/* iOS Safe Area */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  )
}
