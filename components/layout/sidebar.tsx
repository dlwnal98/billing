"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, FileText, List, Users, User, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"

import { supabase } from "@/lib/supabase"

const menuItems = [
  { href: "/", label: "홈", icon: Home },
  { href: "/issue", label: "세금계산서 발행", icon: FileText },
  { href: "/history", label: "발행 내역", icon: List },
  { href: "/clients", label: "거래처 관리", icon: Users },
  { href: "/mypage", label: "내 정보", icon: User },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push("/login")
      router.refresh()
    } catch (err) {
      console.error("로그아웃 오류:", err)
    }
  }

  return (
    <aside className="hidden md:flex md:flex-col md:w-60 md:fixed md:inset-y-0 bg-[#F9FAFB] border-r border-gray-200">
      {/* 서비스명 */}
      <div className="flex items-center h-16 px-6 border-b border-gray-200">
        <h1 className="text-lg font-bold text-gray-900">세금계산서 발행</h1>
      </div>

      {/* 메뉴 */}
      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== "/" && pathname.startsWith(item.href))
            const Icon = item.icon
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 min-h-[44px] rounded-lg text-base transition-colors",
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span>{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* 로그아웃 */}
      <div className="p-3 border-t border-gray-200">
        <button
          className="flex items-center gap-3 w-full px-3 min-h-[44px] rounded-lg text-base text-gray-700 hover:bg-gray-100 transition-colors"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span>로그아웃</span>
        </button>
      </div>
    </aside>
  )
}
