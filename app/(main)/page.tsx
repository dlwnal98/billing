"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AlertTriangle, ArrowRight, FileText, CheckCircle, Clock, XCircle } from "lucide-react"

interface DashboardStats {
  thisMonth: { count: number; supplyCostTotal: number; taxTotal: number }
  recent: { id: string; writeDate: string; receiverCorpName: string; totalAmount: number; sendState: string }[]
  certRegistered: boolean
}

function StatusBadge({ state }: { state: string }) {
  const config: Record<string, { label: string; className: string; icon: React.ElementType }> = {
    "전송완료": { label: "전송완료", className: "bg-green-100 text-green-700", icon: CheckCircle },
    "전송대기": { label: "전송대기", className: "bg-yellow-100 text-yellow-700", icon: Clock },
    "오류": { label: "오류", className: "bg-red-100 text-red-700", icon: XCircle },
  }

  const { label, className, icon: Icon } = config[state] || { label: state, className: "bg-gray-100 text-gray-700", icon: Clock }

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-medium ${className}`}>
      <Icon className="w-4 h-4" />
      {label}
    </span>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const [data, setData] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch("/api/dashboard")
        if (res.ok) {
          const result: DashboardStats = await res.json()
          setData(result)
        }
      } catch (err) {
        console.error("대시보드 데이터를 가져오지 못했습니다:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  const formatCurrency = (amount: number) => amount.toLocaleString("ko-KR") + "원"

  if (loading) {
    return (
      <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-xl" />
          ))}
        </div>
        <div className="h-16 bg-gray-200 rounded-xl w-full" />
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4" />
          <div className="h-64 bg-gray-100 rounded-xl w-full" />
        </div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      {/* 인증서 미등록 경고 배너 */}
      {!data.certRegistered && (
        <div 
          onClick={() => router.push("/cert")}
          className="cursor-pointer mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center justify-between gap-4 hover:bg-yellow-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            </div>
            <p className="text-base text-yellow-800 font-medium">
              공동인증서가 등록되지 않았습니다. 세금계산서 발행을 위해 지금 등록하세요!
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-yellow-600" />
        </div>
      )}

      {/* 헤더 */}
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          안녕하세요!
        </h1>
        <p className="text-base text-gray-600">
          오늘도 편리하게 세금계산서를 발행해 보세요.
        </p>
      </header>

      {/* 이번 달 현황 카드 */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">이번 달 현황</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <p className="text-base text-gray-500 mb-2">발행 건수</p>
            <p className="text-3xl md:text-4xl font-bold text-gray-900">
              {data.thisMonth.count}
              <span className="text-xl font-medium text-gray-500 ml-1">건</span>
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <p className="text-base text-gray-500 mb-2">공급가액</p>
            <p className="text-2xl md:text-3xl font-bold text-gray-900">
              {formatCurrency(data.thisMonth.supplyCostTotal)}
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <p className="text-base text-gray-500 mb-2">세액</p>
            <p className="text-2xl md:text-3xl font-bold text-blue-600">
              {formatCurrency(data.thisMonth.taxTotal)}
            </p>
          </div>
        </div>
      </section>

      {/* 메인 버튼 */}
      <section className="mb-8">
        <button
          onClick={() => router.push("/issue")}
          className="flex items-center justify-center gap-3 w-full py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold rounded-xl transition-all shadow-md active:scale-[0.98]"
        >
          <FileText className="w-6 h-6" />
          세금계산서 발행하기
        </button>
      </section>

      {/* 최근 발행 내역 */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">최근 발행 내역</h2>
          {data.recent.length > 0 && (
            <Link
              href="/history"
              className="flex items-center gap-1 text-base text-blue-600 hover:text-blue-700 font-medium"
            >
              전체 내역 보기
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {data.recent.length > 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            {/* 테이블 - PC */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-base font-semibold text-gray-700">발행일</th>
                    <th className="px-4 py-3 text-left text-base font-semibold text-gray-700">거래처명</th>
                    <th className="px-4 py-3 text-right text-base font-semibold text-gray-700">합계금액</th>
                    <th className="px-4 py-3 text-center text-base font-semibold text-gray-700">전송상태</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.recent.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4 text-base text-gray-600">{invoice.writeDate}</td>
                      <td className="px-4 py-4 text-base text-gray-900 font-medium">{invoice.receiverCorpName}</td>
                      <td className="px-4 py-4 text-base text-gray-900 text-right font-medium">{formatCurrency(invoice.totalAmount)}</td>
                      <td className="px-4 py-4 text-center">
                        <StatusBadge state={invoice.sendState} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 카드 리스트 - 모바일 */}
            <div className="md:hidden divide-y divide-gray-100">
              {data.recent.map((invoice) => (
                <div key={invoice.id} className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <p className="text-base font-medium text-gray-900">{invoice.receiverCorpName}</p>
                      <p className="text-sm text-gray-500 mt-0.5">{invoice.writeDate}</p>
                    </div>
                    <StatusBadge state={invoice.sendState} />
                  </div>
                  <p className="text-lg font-semibold text-gray-900">{formatCurrency(invoice.totalAmount)}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-50 rounded-full flex items-center justify-center">
              <FileText className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-lg text-gray-500">아직 발행한 세금계산서가 없습니다.</p>
            <Link
              href="/issue"
              className="inline-flex items-center gap-2 mt-6 px-6 py-2 bg-blue-50 text-blue-600 rounded-lg text-base hover:bg-blue-100 transition-colors font-medium"
            >
              첫 세금계산서 발행하기
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </section>
    </div>
  )
}
