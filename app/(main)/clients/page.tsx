"use client"

import { useState, useMemo, useEffect } from "react"
import { Users, Plus, Search, Pencil, Trash2, X, Building2, Loader2 } from "lucide-react"
import { Client } from "@/types"

function formatCorpNum(v: string) {
  const n = v.replace(/[^0-9]/g, '').slice(0, 10)
  if (n.length <= 3) return n
  if (n.length <= 5) return n.slice(0, 3) + '-' + n.slice(3)
  return n.slice(0, 3) + '-' + n.slice(3, 5) + '-' + n.slice(5, 10)
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  // 폼 상태
  const [formData, setFormData] = useState({
    corpName: "",
    corpNum: "",
    ceoName: "",
    email: "",
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)

  const fetchClients = async () => {
    try {
      const res = await fetch("/api/clients")
      if (res.ok) {
        const data = await res.json()
        setClients(data.clients)
      }
    } catch (err) {
      console.error("거래처 로드 오류:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClients()
  }, [])

  // 검색 필터링
  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) return clients
    const query = searchQuery.toLowerCase()
    return clients.filter(
      (client) =>
        client.corpName.toLowerCase().includes(query) ||
        client.corpNum.replace(/-/g, "").includes(query.replace(/-/g, ""))
    )
  }, [clients, searchQuery])

  const openAddModal = () => {
    setEditingClient(null)
    setFormData({ corpName: "", corpNum: "", ceoName: "", email: "" })
    setFormErrors({})
    setIsModalOpen(true)
  }

  const openEditModal = (client: Client) => {
    setEditingClient(client)
    setFormData({
      corpName: client.corpName,
      corpNum: client.corpNum,
      ceoName: client.ceoName || "",
      email: client.email || "",
    })
    setFormErrors({})
    setIsModalOpen(true)
  }

  const closeModal = () => {
    if (isSaving) return
    setIsModalOpen(false)
    setEditingClient(null)
    setFormData({ corpName: "", corpNum: "", ceoName: "", email: "" })
    setFormErrors({})
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}
    if (!formData.corpName.trim()) {
      errors.corpName = "거래처 이름을 입력해 주세요."
    }
    if (!formData.corpNum.trim()) {
      errors.corpNum = "사업자번호를 입력해 주세요."
    } else if (formData.corpNum.replace(/-/g, "").length !== 10) {
      errors.corpNum = "사업자번호 10자리를 입력해 주세요."
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "올바른 이메일 형식을 입력해 주세요."
    }
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) return

    setIsSaving(true)
    try {
      const url = editingClient ? `/api/clients/${editingClient.id}` : "/api/clients"
      const method = editingClient ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          corpName: formData.corpName,
          corpNum: formData.corpNum.replace(/-/g, ""),
          ceoName: formData.ceoName,
          email: formData.email,
        }),
      })

      if (res.ok) {
        await fetchClients()
        closeModal()
      } else {
        const error = await res.json()
        alert(error.message || "저장 중 오류가 발생했습니다.")
      }
    } catch (err) {
      console.error("저장 오류:", err)
      alert("서버와 통신 중 오류가 발생했습니다.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/clients/${id}`, { method: "DELETE" })
      if (res.ok) {
        await fetchClients()
        setDeleteConfirmId(null)
      } else {
        const error = await res.json()
        alert(error.message || "삭제 중 오류가 발생했습니다.")
      }
    } catch (err) {
      console.error("삭제 오류:", err)
      alert("서버와 통신 중 오류가 발생했습니다.")
    }
  }

  if (loading && clients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <p className="text-lg text-gray-600 font-medium">거래처 정보를 불러오고 있습니다...</p>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      {/* 헤더 */}
      <header className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">거래처 관리</h1>
            </div>
            <p className="text-base text-gray-600">
              저장된 거래처는 세금계산서 발행 시 바로 선택할 수 있습니다.
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg px-6 py-3.5 rounded-xl transition-all shadow-md active:scale-[0.98]"
          >
            <Plus className="w-5 h-5 stroke-[3px]" />
            거래처 추가
          </button>
        </div>
      </header>

      {/* 검색창 */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="거래처명 또는 사업자번호 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
          />
        </div>
      </div>

      {/* 거래처 목록 */}
      {filteredClients.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center shadow-sm">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Building2 className="w-10 h-10 text-gray-300" />
          </div>
          <p className="text-xl text-gray-500 font-medium mb-6">
            {searchQuery
              ? "검색 결과와 일치하는 거래처가 없습니다."
              : "등록된 거래처가 없습니다. 첫 거래처를 추가해 보세요."}
          </p>
          {!searchQuery && (
            <button
              onClick={openAddModal}
              className="text-blue-600 hover:text-blue-700 font-bold text-lg underline underline-offset-4"
            >
              거래처 추가하기
            </button>
          )}
        </div>
      ) : (
        <>
          {/* PC: 테이블 */}
          <div className="hidden md:block bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left text-base font-bold text-gray-700 px-6 py-4">거래처 이름</th>
                  <th className="text-left text-base font-bold text-gray-700 px-6 py-4">사업자번호</th>
                  <th className="text-left text-base font-bold text-gray-700 px-6 py-4">대표자</th>
                  <th className="text-left text-base font-bold text-gray-700 px-6 py-4">이메일</th>
                  <th className="text-center text-base font-bold text-gray-700 px-6 py-4 w-24">수정</th>
                  <th className="text-center text-base font-bold text-gray-700 px-6 py-4 w-24">삭제</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-5 text-lg font-semibold text-gray-900">{client.corpName}</td>
                    <td className="px-6 py-5 text-base text-gray-600 font-mono tracking-tight">{formatCorpNum(client.corpNum)}</td>
                    <td className="px-6 py-5 text-base text-gray-600">{client.ceoName || "-"}</td>
                    <td className="px-6 py-5 text-base text-gray-600">{client.email || "-"}</td>
                    <td className="px-6 py-5 text-center">
                      <button
                        onClick={() => openEditModal(client)}
                        className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        aria-label="수정"
                      >
                        <Pencil className="w-6 h-6" />
                      </button>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <button
                        onClick={() => setDeleteConfirmId(client.id)}
                        className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        aria-label="삭제"
                      >
                        <Trash2 className="w-6 h-6" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 모바일: 카드 */}
          <div className="md:hidden space-y-4">
            {filteredClients.map((client) => (
              <div
                key={client.id}
                className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm active:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{client.corpName}</h3>
                    <p className="text-base text-gray-500 font-mono">{formatCorpNum(client.corpNum)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(client)}
                      className="p-2 text-gray-400 hover:text-blue-600"
                    >
                      <Pencil className="w-6 h-6" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(client.id)}
                      className="p-2 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="w-6 h-6" />
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5 text-base">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 min-w-[60px]">대표자</span>
                    <span className="text-gray-700 font-medium">{client.ceoName || "-"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 min-w-[60px]">이메일</span>
                    <span className="text-gray-700 font-medium truncate">{client.email || "-"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* 추가/수정 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingClient ? "거래처 정보 수정" : "새 거래처 등록"}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-2">상호(사업자 이름) <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.corpName}
                  onChange={(e) => setFormData((p) => ({ ...p, corpName: e.target.value }))}
                  placeholder="거래처 이름을 입력하세요"
                  className={`w-full px-5 py-4 text-lg border rounded-2xl focus:outline-none focus:ring-4 transition-all ${
                    formErrors.corpName ? "border-red-400 ring-red-100" : "border-gray-200 focus:ring-blue-100 focus:border-blue-500"
                  }`}
                />
                {formErrors.corpName && <p className="mt-1.5 text-base text-red-500 font-medium">{formErrors.corpName}</p>}
              </div>

              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-2">사업자등록번호 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.corpNum}
                  onChange={(e) => setFormData((p) => ({ ...p, corpNum: formatCorpNum(e.target.value) }))}
                  placeholder="000-00-00000"
                  className={`w-full px-5 py-4 text-lg border rounded-2xl focus:outline-none focus:ring-4 transition-all font-mono ${
                    formErrors.corpNum ? "border-red-400 ring-red-100" : "border-gray-200 focus:ring-blue-100 focus:border-blue-500"
                  }`}
                />
                {formErrors.corpNum && <p className="mt-1.5 text-base text-red-500 font-medium">{formErrors.corpNum}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-lg font-semibold text-gray-700 mb-2">대표자 성명</label>
                  <input
                    type="text"
                    value={formData.ceoName}
                    onChange={(e) => setFormData((p) => ({ ...p, ceoName: e.target.value }))}
                    className="w-full px-5 py-4 text-lg border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="block text-lg font-semibold text-gray-700 mb-2">이메일 주소</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                    className="w-full px-5 py-4 text-lg border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-6 py-4 text-lg font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 px-6 py-4 text-lg font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 rounded-2xl transition-colors shadow-lg shadow-blue-200"
                >
                  {isSaving ? "저장 중..." : "저장완료"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-sm p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">거래처 삭제</h3>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">정말로 삭제하시겠습니까? 거래처 내역이 삭제되며 복구할 수 없습니다.</p>
            <div className="flex gap-4">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 px-5 py-3.5 text-lg font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 px-5 py-3.5 text-lg font-bold text-white bg-red-600 hover:bg-red-700 rounded-2xl transition-colors shadow-lg shadow-red-200"
              >
                삭제하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
