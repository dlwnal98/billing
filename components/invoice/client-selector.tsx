"use client"

import { useState, useRef, useEffect } from "react"
import { Search, ChevronDown, Check, Plus, X, Pencil, Users } from "lucide-react"
import { Client, ClientGroup } from "@/types"
import { cn } from "@/lib/utils"

interface ClientSelectorProps {
  groupId: string
  group: ClientGroup
  savedClients: Client[]
  onSelectClient: (client: Client) => void
  onUpdateGroup: (field: keyof ClientGroup, value: any) => void
  onClearSelection: () => void
}

export function ClientSelector({
  groupId,
  group,
  savedClients,
  onSelectClient,
  onUpdateGroup,
  onClearSelection,
}: ClientSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const filteredClients = savedClients.filter(
    (client) =>
      client.corpName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.corpNum.includes(searchQuery.replace(/-/g, ""))
  )

  const formatCorpNum = (v: string) => {
    const n = v.replace(/[^0-9]/g, '').slice(0, 10)
    if (n.length <= 3) return n
    if (n.length <= 5) return n.slice(0, 3) + '-' + n.slice(3)
    return n.slice(0, 3) + '-' + n.slice(3, 5) + '-' + n.slice(5, 10)
  }

  // 선택 완료 상태
  if (group.clientId) {
    return (
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 border-l-green-500">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-50 rounded-lg">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-xl font-black text-gray-900 truncate">{group.corpName}</p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-base font-medium text-gray-600">
            <p>사업자번호: <span className="text-gray-900 font-bold">{formatCorpNum(group.corpNum)}</span></p>
            <p>대표자: <span className="text-gray-900 font-bold">{group.ceoName}</span></p>
            <p>이메일: <span className="text-gray-900 font-bold">{group.email}</span></p>
          </div>
        </div>
        <button
          onClick={onClearSelection}
          className="flex items-center justify-center gap-2 px-5 py-3 text-lg font-bold text-gray-500 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 rounded-2xl transition-all"
        >
          <Pencil className="w-5 h-5" />
          거래처 변경
        </button>
      </div>
    )
  }

  // 직접 입력/선택 대기 상태
  return (
    <div className="relative space-y-4" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-[64px] flex items-center justify-between px-6 py-4 text-lg border border-gray-200 rounded-2xl bg-white hover:border-blue-500 hover:ring-4 hover:ring-blue-100 transition-all shadow-sm"
      >
        <span className="text-gray-400 font-semibold">{group.corpName ? group.corpName : "거래처를 선택하거나 직접 입력하세요"}</span>
        <ChevronDown className={cn("w-6 h-6 text-gray-400 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
          {/* 검색창 */}
          <div className="p-5 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 pl-12 pr-4 py-2 text-lg border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                placeholder="상호명 또는 사업자번호 검색..."
                autoFocus
              />
            </div>
          </div>

          {/* 거래처 목록 */}
          <div className="max-h-64 overflow-y-auto">
            {filteredClients.length > 0 ? (
              filteredClients.map((client) => (
                <button
                  key={client.id}
                  onClick={() => {
                    onSelectClient(client)
                    setIsOpen(false)
                    setSearchQuery("")
                  }}
                  className="w-full flex items-center gap-4 px-6 py-4 text-left hover:bg-blue-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-bold text-gray-900 truncate mb-0.5">{client.corpName}</p>
                    <p className="text-base text-gray-500 font-medium font-mono">{formatCorpNum(client.corpNum)}</p>
                  </div>
                  <Check className="w-5 h-5 text-blue-600 opacity-0 group-hover:opacity-100" />
                </button>
              ))
            ) : (
              <div className="px-6 py-10 text-center">
                <p className="text-lg text-gray-400 font-medium italic">검색 결과가 없습니다.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 수동 입력 필드 (선택되지 않았을 때) */}
      {!group.clientId && (
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-base font-bold text-gray-700 mb-2">거래처(상호) <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={group.corpName}
                onChange={(e) => onUpdateGroup('corpName', e.target.value)}
                placeholder="거래처 이름을 입력하세요"
                className="w-full px-5 py-4 text-lg border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium"
              />
            </div>
            <div>
              <label className="block text-base font-bold text-gray-700 mb-2">사업자번호 <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={formatCorpNum(group.corpNum)}
                onChange={(e) => onUpdateGroup('corpNum', e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                placeholder="000-00-00000"
                className="w-full px-5 py-4 text-lg border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-mono font-bold"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-base font-bold text-gray-700 mb-2">대표자</label>
              <input
                type="text"
                value={group.ceoName}
                onChange={(e) => onUpdateGroup('ceoName', e.target.value)}
                placeholder="대표자 이름"
                className="w-full px-5 py-4 text-lg border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium"
              />
            </div>
            <div>
              <label className="block text-base font-bold text-gray-700 mb-2">이메일 <span className="text-red-500">*</span></label>
              <input
                type="email"
                value={group.email}
                onChange={(e) => onUpdateGroup('email', e.target.value)}
                placeholder="invoice@example.com"
                className="w-full px-5 py-4 text-lg border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
