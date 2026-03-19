"use client"

import { useState, useEffect } from "react"
import { List, Search, ChevronLeft, ChevronRight, FileText, Calendar, Filter } from "lucide-react"
import { Taxinvoice } from "@/types"
import { formatNumber } from "@/lib/invoice-utils"
import { cn } from "@/lib/utils"

export default function InvoiceHistoryPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("")
  const [items, setItems] = useState<Taxinvoice[]>([])
  const [summary, setSummary] = useState({ count: 0, supplyCostTotal: 0, taxTotal: 0 })
  const [loading, setLoading] = useState(true)

  const fetchHistory = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        year: String(year),
        month: String(month).padStart(2, '0'),
        search,
        status
      })
      const res = await fetch(`/api/history?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setItems(data.items)
        setSummary(data.summary)
      }
    } catch (err) {
      console.error("이력 로드 오류:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [year, month, status])

  const handlePrevMonth = () => {
    if (month === 1) {
      setYear(year - 1)
      setMonth(12)
    } else {
      setMonth(month - 1)
    }
  }

  const handleNextMonth = () => {
    if (month === 12) {
      setYear(year + 1)
      setMonth(1)
    } else {
      setMonth(month + 1)
    }
  }

  const getStatusBadge = (state: string) => {
    switch (state) {
      case "전송완료":
        return <span className="inline-flex items-center px-2.5 py-1 text-sm font-bold text-green-700 bg-green-100 rounded-lg">전송완료</span>
      case "전송대기":
        return <span className="inline-flex items-center px-2.5 py-1 text-sm font-bold text-yellow-700 bg-yellow-100 rounded-lg">전송대기</span>
      case "오류":
        return <span className="inline-flex items-center px-2.5 py-1 text-sm font-bold text-red-700 bg-red-100 rounded-lg">발행오류</span>
      default:
        return <span className="inline-flex items-center px-2.5 py-1 text-sm font-bold text-gray-700 bg-gray-100 rounded-lg">{state}</span>
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto pb-32">
      {/* 헤더 */}
      <header className="mb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-4 mb-3">
              <div className="p-2.5 bg-green-600 rounded-2xl shadow-lg shadow-green-100">
                <List className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">발행 내역</h1>
            </div>
            <p className="text-lg text-gray-500 font-medium">
              과거에 발행한 세금계산서의 상세 내역과 전송 상태를 확인합니다.
            </p>
          </div>
          
          {/* 기간 선택기 */}
          <div className="flex items-center bg-white border border-gray-200 p-1.5 rounded-2xl shadow-sm">
            <button onClick={handlePrevMonth} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="px-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span className="text-xl font-black text-gray-900">{year}년 {month}월</span>
            </div>
            <button onClick={handleNextMonth} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* 요약 현황 */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm">
          <p className="text-gray-500 font-bold mb-2">총 발행 건수</p>
          <p className="text-2xl font-black text-gray-900">{summary.count}건</p>
        </div>
        <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm">
          <p className="text-gray-500 font-bold mb-2">공급가액 총액</p>
          <p className="text-2xl font-black text-blue-600">{summary.supplyCostTotal.toLocaleString()}원</p>
        </div>
        <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm">
          <p className="text-gray-500 font-bold mb-2">세액 총액</p>
          <p className="text-2xl font-black text-gray-900">{summary.taxTotal.toLocaleString()}원</p>
        </div>
      </section>

      {/* 필터 및 검색 */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchHistory()}
            placeholder="거래처명을 입력하고 Enter를 누르세요"
            className="w-full h-[60px] pl-12 pr-4 text-lg border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 shadow-sm transition-all"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-[60px] pl-12 pr-10 text-lg border border-gray-200 rounded-2xl bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 shadow-sm transition-all cursor-pointer appearance-none min-w-[160px]"
          >
            <option value="">전체 상태</option>
            <option value="전송완료">전송완료</option>
            <option value="전송대기">전송대기</option>
            <option value="오류">발행오류</option>
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* 테이블 목록 */}
      <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-base font-bold text-gray-700">작성일자</th>
                <th className="px-6 py-4 text-left text-base font-bold text-gray-700">거래처명</th>
                <th className="px-6 py-4 text-right text-base font-bold text-gray-700">공급가액</th>
                <th className="px-6 py-4 text-right text-base font-bold text-gray-700">세액</th>
                <th className="px-6 py-4 text-center text-base font-bold text-gray-700">전송상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      <p className="text-lg text-gray-400 font-bold">내역을 불러오고 있습니다...</p>
                    </div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-32 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="p-4 bg-gray-50 rounded-full">
                         <FileText className="w-12 h-12 text-gray-300" />
                      </div>
                      <p className="text-xl text-gray-400 font-bold">이번 달 발행한 세금계산서가 없습니다.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-blue-50/50 transition-colors cursor-pointer group">
                    <td className="px-6 py-5 text-base text-gray-600 font-mono">
                      {item.writeDate}
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-lg font-bold text-gray-800 group-hover:text-blue-700 transition-colors">
                        {item.receiverCorpName}
                      </p>
                      <p className="text-sm text-gray-400 font-medium">{item.receiverCorpNum}</p>
                    </td>
                    <td className="px-6 py-5 text-right font-bold text-gray-800">
                      {item.supplyCost.toLocaleString()}원
                    </td>
                    <td className="px-6 py-5 text-right font-bold text-blue-600">
                      {item.tax.toLocaleString()}원
                    </td>
                    <td className="px-6 py-5 text-center">
                      {getStatusBadge(item.sendState)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function ChevronDown(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}
