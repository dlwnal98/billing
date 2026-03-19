'use client'

import { Sidebar } from "./layout/sidebar"
import { MobileTabBar } from "./layout/mobile-tab-bar"

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* PC 사이드바 */}
      <Sidebar />

      {/* 메인 콘텐츠 영역 */}
      <main className="md:pl-60">
        <div className="min-h-screen pb-20 md:pb-0">
          {children}
        </div>
      </main>

      {/* 모바일 하단 탭바 */}
      <MobileTabBar />
    </div>
  )
}
