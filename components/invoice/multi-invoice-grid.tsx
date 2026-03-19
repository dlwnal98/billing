"use client"

import { useRef, useEffect } from "react"
import { Plus, Trash2, Monitor } from "lucide-react"
import { InvoiceFormItem } from "@/types"

interface GridFormProps {
  groupId: string
  invoices: InvoiceFormItem[]
  onUpdate: (id: string, field: keyof InvoiceFormItem, value: string) => void
  onDelete: (id: string) => void
  onAdd: () => void
  onSupplyCostChange: (id: string, value: string) => void
}

export function GridForm({
  groupId,
  invoices,
  onUpdate,
  onDelete,
  onAdd,
  onSupplyCostChange,
}: GridFormProps) {
  const inputRefs = useRef<Map<string, HTMLInputElement>>(new Map())

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    invoiceId: string,
    field: string,
    index: number
  ) => {
    if (e.key === "Tab") {
      e.preventDefault()
      const fields = ["writeDate", "itemName", "supplyCost", "tax", "remark"]
      const currentFieldIndex = fields.indexOf(field)
      
      let nextIndex = index
      let nextFieldIndex = currentFieldIndex + 1
      
      if (nextFieldIndex >= fields.length) {
        nextFieldIndex = 0
        nextIndex = index + 1
        if (nextIndex >= invoices.length) {
          onAdd()
          setTimeout(() => {
            const nextInput = inputRefs.current.get(`${invoices[invoices.length - 1].id}-writeDate`)
            nextInput?.focus()
          }, 50)
          return
        }
      }
      
      const nextInvoiceId = invoices[nextIndex].id
      const nextInput = inputRefs.current.get(`${nextInvoiceId}-${fields[nextFieldIndex]}`)
      nextInput?.focus()
    }
  }

  const setInputRef = (key: string, el: HTMLInputElement | null) => {
    if (el) {
      inputRefs.current.set(key, el)
    } else {
      inputRefs.current.delete(key)
    }
  }

  const totalAmount = invoices.reduce((acc, inv) => 
    acc + Number(inv.supplyCost.replace(/,/g, '') || 0) + Number(inv.tax.replace(/,/g, '') || 0), 0)

  return (
    <div className="space-y-4">
      {/* 모바일 안내 배너 */}
      <div className="md:hidden bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
        <Monitor className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-base text-blue-800 font-medium leading-relaxed">
          이 기능은 PC 환경에서 사용하시면 더 편리하고 빠르게 입력하실 수 있습니다.
        </p>
      </div>

      {/* PC 그리드 뷰 */}
      <div className="hidden md:block overflow-x-auto bg-white border border-gray-200 rounded-3xl shadow-sm">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-3 py-4 text-left text-base font-bold text-gray-700 w-44">발행일자</th>
              <th className="px-3 py-4 text-left text-base font-bold text-gray-700">품목명</th>
              <th className="px-3 py-4 text-right text-base font-bold text-gray-700 w-40">공급가액</th>
              <th className="px-3 py-4 text-right text-base font-bold text-gray-700 w-36">세액</th>
              <th className="px-3 py-4 text-left text-base font-bold text-gray-700 w-48">비고</th>
              <th className="px-3 py-4 text-center text-base font-bold text-gray-700 w-16">삭제</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {invoices.map((inv, index) => (
              <tr key={inv.id} className="hover:bg-blue-50/50 transition-colors">
                <td className="px-1 py-1">
                  <input
                    ref={(el) => setInputRef(`${inv.id}-writeDate`, el)}
                    type="date"
                    value={inv.writeDate}
                    onChange={(e) => onUpdate(inv.id, 'writeDate', e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, inv.id, "writeDate", index)}
                    className="w-full px-4 py-2 text-base border-transparent hover:border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl transition-all font-medium bg-transparent"
                  />
                </td>
                <td className="px-1 py-1">
                  <input
                    ref={(el) => setInputRef(`${inv.id}-itemName`, el)}
                    type="text"
                    value={inv.itemName}
                    onChange={(e) => onUpdate(inv.id, 'itemName', e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, inv.id, "itemName", index)}
                    placeholder="품목명 입력"
                    className="w-full px-4 py-2 text-base border-transparent hover:border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl transition-all font-medium bg-transparent"
                  />
                </td>
                <td className="px-1 py-1 text-right">
                  <input
                    ref={(el) => setInputRef(`${inv.id}-supplyCost`, el)}
                    type="text"
                    inputMode="numeric"
                    value={inv.supplyCost}
                    onChange={(e) => onSupplyCostChange(inv.id, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, inv.id, "supplyCost", index)}
                    placeholder="0"
                    className="w-full px-4 py-2 text-base text-right border-transparent hover:border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl transition-all font-bold text-gray-900 bg-transparent"
                  />
                </td>
                <td className="px-1 py-1 text-right">
                  <input
                    ref={(el) => setInputRef(`${inv.id}-tax`, el)}
                    type="text"
                    inputMode="numeric"
                    value={inv.tax ? Number(inv.tax).toLocaleString() : ""}
                    onChange={(e) => onUpdate(inv.id, 'tax', e.target.value.replace(/[^0-9]/g, ''))}
                    onKeyDown={(e) => handleKeyDown(e, inv.id, "tax", index)}
                    placeholder="0"
                    className="w-full px-4 py-2 text-base text-right border-transparent hover:border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl transition-all font-bold text-blue-700 bg-transparent"
                  />
                </td>
                <td className="px-1 py-1">
                  <input
                    ref={(el) => setInputRef(`${inv.id}-remark`, el)}
                    type="text"
                    value={inv.remark}
                    onChange={(e) => onUpdate(inv.id, 'remark', e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, inv.id, "remark", index)}
                    placeholder="비고 입력"
                    className="w-full px-4 py-2 text-base border-transparent hover:border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl transition-all font-medium bg-transparent"
                  />
                </td>
                <td className="px-1 py-1 text-center">
                  {invoices.length > 1 && (
                    <button
                      onClick={() => onDelete(inv.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-blue-50/30 border-t border-gray-100 font-bold">
              <td colSpan={2} className="px-4 py-4 text-base text-blue-900">총 합계금액 (공급가액 + 세액)</td>
              <td colSpan={4} className="px-4 py-4 text-right text-xl font-black text-blue-700">
                {totalAmount.toLocaleString()}원
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* 모바일 뷰 카드 처리 (가독성을 위한 안내 배너 아래 배치) */}
      <div className="md:hidden space-y-4">
        {invoices.map((inv, index) => (
          <div key={inv.id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
             {/* 모바일 폼 로직은 CardForm과 동일한 구성을 직접 그리거나 여기서 생략하고 "그리드"는 데스크탑 최적화로 유지 */}
             <div className="flex items-center justify-between mb-4">
               <span className="text-blue-700 font-bold">#{index + 1}</span>
               <button onClick={() => onDelete(inv.id)} className="text-red-500 p-2"><Trash2 className="w-5 h-5"/></button>
             </div>
             <div className="space-y-4">
                <input type="date" value={inv.writeDate} onChange={(e) => onUpdate(inv.id, 'writeDate', e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl"/>
                <input type="text" value={inv.itemName} onChange={(e) => onUpdate(inv.id, 'itemName', e.target.value)} placeholder="품목명" className="w-full px-4 py-3 border border-gray-200 rounded-xl"/>
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" value={inv.supplyCost} onChange={(e) => onSupplyCostChange(inv.id, e.target.value)} placeholder="공급가액" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-right font-bold"/>
                  <input type="text" value={inv.tax ? Number(inv.tax).toLocaleString() : ""} readOnly className="w-full px-4 py-3 border border-gray-200 rounded-xl text-right font-bold bg-gray-50"/>
                </div>
                <div className="text-right text-lg font-black text-blue-700 pt-2">
                  합계: {(Number(inv.supplyCost.replace(/,/g, '')) + Number(inv.tax)).toLocaleString()}원
                </div>
             </div>
          </div>
        ))}
      </div>

      {/* 행 추가 버튼 */}
      <button
        onClick={onAdd}
        className="w-full flex items-center justify-center gap-2 px-6 py-4 text-lg font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-2xl transition-all shadow-sm shadow-blue-50 border-2 border-dashed border-blue-200"
      >
        <Plus className="w-5 h-5 border-2 border-blue-600 rounded-full stroke-[3px]" />
        정보 입력 행 추가
      </button>
    </div>
  )
}
