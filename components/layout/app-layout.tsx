import { Sidebar } from "./sidebar"
import { MobileTabBar } from "./mobile-tab-bar"

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
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
