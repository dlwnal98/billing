"use client"

import { Trash2 } from "lucide-react"
import { InvoiceFormItem } from "@/types"

interface CardFormProps {
  groupId: string
  invoice: InvoiceFormItem
  index: number
  canDelete: boolean
  onUpdate: (field: keyof InvoiceFormItem, value: string) => void
  onDelete: () => void
  onSupplyCostChange: (value: string) => void
}

export function CardForm({
  groupId,
  invoice,
  index,
  canDelete,
  onUpdate,
  onDelete,
  onSupplyCostChange,
}: CardFormProps) {
  const total = Number(invoice.supplyCost.replace(/,/g, '') || 0) + Number(invoice.tax.replace(/,/g, '') || 0)

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 md:p-6 shadow-sm border-l-4 border-l-blue-500">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 rounded-lg font-bold text-base">
            {index + 1}
          </span>
          <h4 className="text-lg font-bold text-gray-900">세금계산서 정보</h4>
        </div>
        {canDelete && (
          <button
            onClick={onDelete}
            className="flex items-center gap-1.5 px-3 py-2 text-base font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-all"
          >
            <Trash2 className="w-5 h-5" />
            삭제
          </button>
        )}
      </div>

      <div className="grid gap-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-base font-bold text-gray-700 mb-2">발행일자 <span className="text-red-500">*</span></label>
            <input
              type="date"
              value={invoice.writeDate}
              onChange={(e) => onUpdate('writeDate', e.target.value)}
              className="w-full px-4 py-3.5 text-lg border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium"
            />
          </div>
          <div>
            <label className="block text-base font-bold text-gray-700 mb-2">품목명 <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={invoice.itemName}
              onChange={(e) => onUpdate('itemName', e.target.value)}
              placeholder="예: 화물 운송료"
              className="w-full px-4 py-3.5 text-lg border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-base font-bold text-gray-700 mb-2">공급가액 <span className="text-red-500">*</span></label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={invoice.supplyCost}
                onChange={(e) => onSupplyCostChange(e.target.value)}
                placeholder="0"
                className="w-full px-4 py-3.5 pr-12 text-lg border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-right font-bold text-gray-900"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg text-gray-400 font-bold">원</span>
            </div>
          </div>
          <div>
            <label className="block text-base font-bold text-gray-700 mb-2">세액 <span className="text-gray-400 font-medium">(10% 자동계산)</span></label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={invoice.tax ? Number(invoice.tax).toLocaleString() : ""}
                onChange={(e) => onUpdate('tax', e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="0"
                className="w-full px-4 py-3.5 pr-12 text-lg border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-right font-bold text-gray-900 bg-gray-50"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg text-gray-400 font-bold">원</span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50/50 rounded-2xl p-5 flex items-center justify-between border border-blue-100">
          <span className="text-lg font-bold text-blue-900">합계금액</span>
          <span className="text-2xl font-black text-blue-700">{total.toLocaleString()}원</span>
        </div>

        <div>
          <label className="block text-base font-bold text-gray-700 mb-2">비고</label>
          <input
            type="text"
            value={invoice.remark}
            onChange={(e) => onUpdate('remark', e.target.value)}
            placeholder="추가 전달사항이 있으면 입력하세요"
            className="w-full px-4 py-3.5 text-lg border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium"
          />
        </div>
      </div>
    </div>
  )
}
