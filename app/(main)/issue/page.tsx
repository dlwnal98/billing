"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { FileText, Plus, X, ChevronLeft, ChevronRight, Calculator, CheckCircle2 } from "lucide-react"
import { Client, ClientGroup, InvoiceFormItem } from "@/types"
import { useApi } from "@/hooks/useApi"
import { ClientSelector } from "@/components/invoice/client-selector"
import { CardForm as CardFormComp } from "@/components/invoice/single-invoice-card"
import { GridForm as GridFormComp } from "@/components/invoice/multi-invoice-grid"
import { cn } from "@/lib/utils"

export default function IssuePage() {
  const router = useRouter()
  const { apiFetch, loading } = useApi()
  
  // 상태 관리
  const [inputMode, setInputMode] = useState<'card' | 'grid'>('card')
  const [activeGroupId, setActiveGroupId] = useState('group-1')
  const [clients, setClients] = useState<Client[]>([])
  const [clientGroups, setClientGroups] = useState<ClientGroup[]>([{
    id: 'group-1',
    clientId: null,
    corpName: '',
    corpNum: '',
    ceoName: '',
    email: '',
    saveToClients: false,
    invoices: [{
      id: crypto.randomUUID(),
      writeDate: new Date().toISOString().split('T')[0],
      itemName: '',
      supplyCost: '',
      tax: '',
      remark: ''
    }]
  }])

  // 탭 스크롤
  const tabsContainerRef = useRef<HTMLDivElement>(null)
  const scrollTabs = (direction: "left" | "right") => {
    if (tabsContainerRef.current) {
      const scrollAmount = 250
      tabsContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }

  // 거래처 목록 불러오기
  useEffect(() => {
    apiFetch<{ clients: Client[] }>('/api/clients').then(d => {
      if (d && d.clients) setClients(d.clients)
    })
  }, [])

  // 거래처 그룹 추가/삭제
  const addClientGroup = () => {
    const newId = `group-${Date.now()}`
    setClientGroups(prev => [...prev, {
      id: newId,
      clientId: null,
      corpName: '',
      corpNum: '',
      ceoName: '',
      email: '',
      saveToClients: false,
      invoices: [{
        id: crypto.randomUUID(),
        writeDate: new Date().toISOString().split('T')[0],
        itemName: '',
        supplyCost: '',
        tax: '',
        remark: ''
      }]
    }])
    setActiveGroupId(newId)
  }

  const removeClientGroup = (groupId: string) => {
    if (clientGroups.length <= 1) return
    const remaining = clientGroups.filter(g => g.id !== groupId)
    setClientGroups(remaining)
    if (activeGroupId === groupId) setActiveGroupId(remaining[0]?.id || '')
  }

  // 계산서 추가/수정/삭제
  const addInvoice = (groupId: string) => {
    setClientGroups(prev => prev.map(g =>
      g.id === groupId ? {
        ...g,
        invoices: [...g.invoices, {
          id: crypto.randomUUID(),
          writeDate: new Date().toISOString().split('T')[0],
          itemName: '',
          supplyCost: '',
          tax: '',
          remark: ''
        }]
      } : g
    ))
  }

  const updateInvoice = (groupId: string, invoiceId: string, field: keyof InvoiceFormItem, value: string) => {
    setClientGroups(prev => prev.map(g =>
      g.id === groupId ? {
        ...g,
        invoices: g.invoices.map(inv =>
          inv.id === invoiceId ? { ...inv, [field]: value } : inv
        )
      } : g
    ))
  }

  const removeInvoice = (groupId: string, invoiceId: string) => {
    setClientGroups(prev => prev.map(g =>
      g.id === groupId ? {
        ...g,
        invoices: g.invoices.filter(inv => inv.id !== invoiceId)
      } : g
    ))
  }

  // 공급가액 입력 (Focus 버딩 방지용 핵심 핸들러)
  const handleSupplyCost = (groupId: string, invoiceId: string, value: string) => {
    const num = value.replace(/[^0-9]/g, '')
    const formatted = num ? Number(num).toLocaleString() : ''
    const tax = num ? String(Math.floor(Number(num) * 0.1)) : ''
    
    setClientGroups(prev => prev.map(g =>
      g.id === groupId ? {
        ...g,
        invoices: g.invoices.map(inv =>
          inv.id === invoiceId ? { ...inv, supplyCost: formatted, tax: tax } : inv
        )
      } : g
    ))
  }

  // 거래처 선택
  const selectClient = (groupId: string, client: Client) => {
    setClientGroups(prev => prev.map(g =>
      g.id === groupId ? {
        ...g,
        clientId: client.id,
        corpName: client.corpName,
        corpNum: client.corpNum,
        ceoName: client.ceoName || '',
        email: client.email || ''
      } : g
    ))
  }

  const clearSelection = (groupId: string) => {
    setClientGroups(prev => prev.map(g =>
      g.id === groupId ? {
        ...g,
        clientId: null,
        corpName: '',
        corpNum: '',
        ceoName: '',
        email: ''
      } : g
    ))
  }

  const updateGroup = (groupId: string, field: keyof ClientGroup, value: string | boolean | null) => {
    setClientGroups(prev => prev.map(g =>
      g.id === groupId ? { ...g, [field]: value } : g
    ))
  }

  // 합계 계산
  const totalCount = clientGroups.reduce((acc, g) =>
    acc + g.invoices.filter(inv => inv.supplyCost).length, 0)
  const totalSupplyCost = clientGroups.reduce((acc, g) =>
    acc + g.invoices.reduce((a, inv) =>
      a + Number(inv.supplyCost.replace(/,/g, '') || 0), 0), 0)

  // 발행하기
  const handleIssue = async () => {
    const items = clientGroups.flatMap(g =>
      g.invoices.filter(inv => inv.supplyCost && inv.itemName).map(inv => ({
        receiverCorpName: g.corpName,
        receiverCorpNum: g.corpNum,
        receiverCeoName: g.ceoName,
        receiverEmail: g.email,
        writeDate: inv.writeDate,
        itemName: inv.itemName,
        supplyCost: Number(inv.supplyCost.replace(/,/g, '')),
        tax: Number(inv.tax.replace(/,/g, '')),
        remark: inv.remark
      }))
    )

    if (items.length === 0) {
      alert('발행할 항목을 입력해 주세요.')
      return
    }

    if (!confirm(`총 ${items.length}건을 발행하시겠습니까?`)) return

    try {
      const res = await apiFetch('/api/issue', {
        method: 'POST',
        body: { items }
      })
      if (res) {
        router.push('/history')
        router.refresh()
      }
    } catch (err) {
      console.error("발행 오류:", err)
    }
  }

  const activeGroup = clientGroups.find(g => g.id === activeGroupId) || clientGroups[0]

  return (
    <div className="min-h-screen pb-32">
      <div className="p-4 md:p-8 max-w-5xl mx-auto">
        {/* 헤더 */}
        <header className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <div className="flex items-center gap-4 mb-3">
                <div className="p-2.5 bg-blue-600 rounded-2xl shadow-lg shadow-blue-100">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">세금계산서 발행</h1>
              </div>
              <p className="text-lg text-gray-500 font-medium">
                거래처별로 항목을 입력하고 한 번에 발행하세요.
              </p>
            </div>

            {/* 입력 모드 스위치 */}
            <div className="inline-flex bg-gray-100 p-1.5 rounded-2xl self-start sm:self-center shadow-inner">
              <button
                onClick={() => setInputMode('card')}
                className={cn(
                  "px-6 py-2.5 text-base font-bold rounded-xl transition-all",
                  inputMode === 'card' ? "bg-white text-blue-600 shadow-md transform scale-105" : "text-gray-500 hover:text-gray-800"
                )}
              >
                한 건씩
              </button>
              <button
                onClick={() => setInputMode('grid')}
                className={cn(
                  "px-6 py-2.5 text-base font-bold rounded-xl transition-all",
                  inputMode === 'grid' ? "bg-white text-blue-600 shadow-md transform scale-105" : "text-gray-500 hover:text-gray-800"
                )}
              >
                대량 입력
              </button>
            </div>
          </div>
        </header>

        {/* 거래처 그룹 탭 */}
        <div className="mb-8 group relative">
          <div className="flex items-center gap-2">
            {clientGroups.length > 3 && (
              <button onClick={() => scrollTabs('left')} className="p-2.5 bg-white border border-gray-100 rounded-full shadow-md text-gray-400 hover:text-blue-600 transition-colors">
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}
            
            <div 
              ref={tabsContainerRef}
              className="flex-1 flex items-center gap-3 overflow-x-auto scrollbar-hide py-2"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {clientGroups.map((g, idx) => (
                <div key={g.id} className="relative flex-shrink-0">
                  <button
                    onClick={() => setActiveGroupId(g.id)}
                    className={cn(
                      "flex items-center gap-3 px-6 py-4 text-lg font-bold rounded-2xl transition-all border-2",
                      activeGroupId === g.id
                        ? "bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-100 -translate-y-1"
                        : "bg-white border-gray-100 text-gray-500 hover:border-blue-200 hover:bg-gray-50"
                    )}
                  >
                    <span className="max-w-[120px] truncate">{g.corpName || `새 거래처 ${idx + 1}`}</span>
                    <span className="bg-blue-800/10 px-2 py-0.5 rounded text-sm">{g.invoices.length}</span>
                  </button>
                  {clientGroups.length > 1 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); removeClientGroup(g.id); }}
                      className={cn(
                        "absolute -top-1.5 -right-1.5 w-6 h-6 flex items-center justify-center rounded-full shadow-md border border-gray-100 backdrop-blur-sm transition-all",
                        activeGroupId === g.id ? "bg-red-500 text-white" : "bg-white text-gray-400"
                      )}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              
              <button
                onClick={addClientGroup}
                className="flex items-center gap-2 px-6 py-4 text-lg font-bold text-blue-600 bg-white border-2 border-dashed border-blue-200 rounded-2xl hover:bg-blue-50 transition-all flex-shrink-0"
              >
                <Plus className="w-5 h-5" />
                거래처 추가
              </button>
            </div>

            {clientGroups.length > 3 && (
              <button onClick={() => scrollTabs('right')} className="p-2.5 bg-white border border-gray-100 rounded-full shadow-md text-gray-400 hover:text-blue-600 transition-colors">
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>

        {/* 거래처 선택/정보 */}
        <section className="mb-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
           <div className="flex items-center gap-2 mb-4">
              <Calculator className="w-5 h-5 text-gray-400" />
              <h2 className="text-xl font-black text-gray-900">거래처 정보</h2>
           </div>
           <ClientSelector
              groupId={activeGroupId}
              group={activeGroup}
              savedClients={clients}
              onSelectClient={(c) => selectClient(activeGroupId, c)}
              onUpdateGroup={(f, v) => updateGroup(activeGroupId, f, v)}
              onClearSelection={() => clearSelection(activeGroupId)}
           />
        </section>

        {/* 계산서 상세 입력 */}
        <section className="mb-20 animate-in fade-in slide-in-from-bottom-2 duration-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-400" />
              <h2 className="text-xl font-black text-gray-900">발행 내용 입력</h2>
            </div>
            {inputMode === 'card' && (
               <button onClick={() => addInvoice(activeGroupId)} className="text-blue-600 font-bold flex items-center gap-1 hover:underline">
                 <Plus className="w-4 h-4" /> 내역 추가
               </button>
            )}
          </div>

          {inputMode === 'card' ? (
            <div className="space-y-6">
              {activeGroup.invoices.map((inv, idx) => (
                <CardFormComp
                  key={inv.id}
                  groupId={activeGroupId}
                  invoice={inv}
                  index={idx}
                  canDelete={activeGroup.invoices.length > 1}
                  onUpdate={(f, v) => updateInvoice(activeGroupId, inv.id, f, v)}
                  onDelete={() => removeInvoice(activeGroupId, inv.id)}
                  onSupplyCostChange={(v) => handleSupplyCost(activeGroupId, inv.id, v)}
                />
              ))}
            </div>
          ) : (
            <GridFormComp
              groupId={activeGroupId}
              invoices={activeGroup.invoices}
              onUpdate={(id, f, v) => updateInvoice(activeGroupId, id, f, v)}
              onDelete={(id) => removeInvoice(activeGroupId, id)}
              onAdd={() => addInvoice(activeGroupId)}
              onSupplyCostChange={(id, v) => handleSupplyCost(activeGroupId, id, v)}
            />
          )}
        </section>
      </div>

      {/* 하단 요약 및 발행 바 */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-xl border-t border-gray-200 p-5 md:pl-72 shadow-2xl animate-in slide-in-from-bottom duration-500">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-8">
            <div className="flex flex-col">
              <span className="text-base text-gray-500 font-bold">총 발행 예정 건수</span>
              <span className="text-2xl font-black text-blue-600">{totalCount}건</span>
            </div>
            <div className="w-px h-10 bg-gray-200 hidden md:block" />
            <div className="flex flex-col">
              <span className="text-base text-gray-500 font-bold">공급가액 총 합계</span>
              <span className="text-2xl font-black text-gray-900">{totalSupplyCost.toLocaleString()}원</span>
            </div>
          </div>
          <button
            onClick={handleIssue}
            disabled={loading}
            className="w-full md:w-auto h-[64px] px-12 text-2xl font-black text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 rounded-3xl transition-all transform active:scale-95 shadow-xl shadow-blue-200 flex items-center justify-center gap-3"
          >
            {loading ? (
              <span className="animate-pulse">처리 중...</span>
            ) : (
              <>
                <CheckCircle2 className="w-8 h-8" />
                지금 바로 발행하기
              </>
            )}
          </button>
        </div>
      </footer>
    </div>
  )
}
