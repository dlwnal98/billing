"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  User as UserIcon, 
  Building2, 
  ShieldCheck, 
  Settings, 
  Pencil, 
  X, 
  Check,
  KeyRound,
  LogOut,
  UserX,
  AlertTriangle,
  Loader2
} from "lucide-react"
import { User } from "@/types"
import { supabase } from "@/lib/supabase"
import { useApi } from "@/hooks/useApi"

interface BusinessInfo {
  businessNumber: string
  companyName: string
  representativeName: string
  businessType: string
  businessCategory: string
  address: string
}

export default function MyPage() {
  const router = useRouter()
  const { apiFetch } = useApi()
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>({
    businessNumber: "",
    companyName: "",
    representativeName: "",
    businessType: "",
    businessCategory: "",
    address: ""
  })
  const [editForm, setEditForm] = useState<BusinessInfo>(businessInfo)
  const [isCertificateRegistered, setIsCertificateRegistered] = useState(false)
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      // 1. 프로필 정보 조회
      const profileData = await apiFetch<{ user: User }>('/api/auth/profile')
      if (profileData && profileData.user) {
        const u = profileData.user
        const info = {
          businessNumber: u.corpNum,
          companyName: u.corpName,
          representativeName: u.ceoName,
          businessType: u.bizType,
          businessCategory: u.bizClass,
          address: u.address
        }
        setBusinessInfo(info)
        setEditForm(info)
      }

      // 2. 인증서 상태 조회
      const certData = await apiFetch<{ certRegistered: boolean }>('/api/cert')
      if (certData) {
        setIsCertificateRegistered(certData.certRegistered)
      }
    } catch (err) {
      console.error("데이터 로드 오류:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleEdit = () => {
    setEditForm(businessInfo)
    setIsEditing(true)
  }

  const handleCancel = () => {
    setEditForm(businessInfo)
    setIsEditing(false)
  }

  const handleSave = async () => {
    try {
      const res = await apiFetch<{ message: string }>('/api/auth/profile', {
        method: 'PUT',
        body: {
          corpName: editForm.companyName,
          ceoName: editForm.representativeName,
          bizType: editForm.businessType,
          bizClass: editForm.businessCategory,
          address: editForm.address
        }
      })
      if (res) {
        setBusinessInfo(editForm)
        setIsEditing(false)
        alert("정보가 수정되었습니다.")
      }
    } catch (err) {
      alert("수정 중 오류가 발생했습니다.")
    }
  }

  const handleLogout = async () => {
    if (!confirm("로그아웃 하시겠습니까?")) return
    try {
      await supabase.auth.signOut()
      router.push("/login")
      router.refresh()
    } catch (err) {
      console.error("로그아웃 오류:", err)
    }
  }

  const handleWithdraw = async () => {
    alert("회원 탈퇴 기능은 현재 고객센터를 통해 접수 가능합니다.")
    setShowWithdrawConfirm(false)
  }

  const formatBusinessNumber = (value: string) => {
    const numbers = value.replace(/[^0-9]/g, "")
    if (numbers.length <= 3) return numbers
    if (numbers.length <= 5) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 5)}-${numbers.slice(5, 10)}`
  }

  if (loading && !businessInfo.businessNumber) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <p className="text-lg text-gray-600 font-medium">정보를 불러오고 있습니다...</p>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto pb-32">
      {/* 헤더 */}
      <header className="mb-10">
        <div className="flex items-center gap-4 mb-3">
          <div className="p-2.5 bg-gray-100 rounded-2xl">
            <UserIcon className="w-8 h-8 text-gray-600" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">내 정보</h1>
        </div>
        <p className="text-lg text-gray-500 font-medium">
          사업자 정보와 계정 설정을 관리합니다.
        </p>
      </header>

      <div className="space-y-8">
        {/* 섹션 1: 사업자 정보 */}
        <section className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between p-6 border-b border-gray-50 bg-gray-50/30">
            <div className="flex items-center gap-3">
              <Building2 className="w-6 h-6 text-gray-400" />
              <h2 className="text-xl font-bold text-gray-900">사업자 정보</h2>
            </div>
            {!isEditing ? (
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-5 py-2.5 text-base font-bold text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
              >
                <Pencil className="w-4 h-4" />
                정보 수정
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-5 py-2.5 text-base font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-all"
                >
                  <X className="w-4 h-4" />
                  취소
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-6 py-2.5 text-base font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-lg shadow-blue-100"
                >
                  <Check className="w-4 h-4" />
                  저장하기
                </button>
              </div>
            )}
          </div>

          <div className="p-6">
            {!isEditing ? (
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                <div className="space-y-1">
                  <dt className="text-base text-gray-400 font-bold">사업자번호</dt>
                  <dd className="text-lg font-black text-gray-900 font-mono tracking-tighter">{formatBusinessNumber(businessInfo.businessNumber)}</dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-base text-gray-400 font-bold">상호(업체명)</dt>
                  <dd className="text-lg font-black text-gray-900">{businessInfo.companyName}</dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-base text-gray-400 font-bold">대표자 성명</dt>
                  <dd className="text-lg font-black text-gray-900">{businessInfo.representativeName}</dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-base text-gray-400 font-bold">업태</dt>
                  <dd className="text-lg font-black text-gray-900">{businessInfo.businessType}</dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-base text-gray-400 font-bold">종목</dt>
                  <dd className="text-lg font-black text-gray-900">{businessInfo.businessCategory}</dd>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <dt className="text-base text-gray-400 font-bold">사업장 주소</dt>
                  <dd className="text-lg font-black text-gray-900">{businessInfo.address}</dd>
                </div>
              </dl>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-base font-bold text-gray-700">사업자번호</label>
                  <input
                    disabled
                    value={formatBusinessNumber(editForm.businessNumber)}
                    className="w-full px-5 py-4 text-lg border border-gray-100 bg-gray-50 rounded-2xl font-mono font-bold text-gray-400"
                  />
                  <p className="text-sm text-gray-400">사업자번호는 고객센터를 통해 변경 가능합니다.</p>
                </div>
                <div className="space-y-2">
                  <label className="block text-base font-bold text-gray-700">상호(업체명)</label>
                  <input
                    type="text"
                    value={editForm.companyName}
                    onChange={(e) => setEditForm({ ...editForm, companyName: e.target.value })}
                    className="w-full px-5 py-4 text-lg border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-base font-bold text-gray-700">대표자 성명</label>
                  <input
                    type="text"
                    value={editForm.representativeName}
                    onChange={(e) => setEditForm({ ...editForm, representativeName: e.target.value })}
                    className="w-full px-5 py-4 text-lg border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-base font-bold text-gray-700">업태</label>
                  <input
                    type="text"
                    value={editForm.businessType}
                    onChange={(e) => setEditForm({ ...editForm, businessType: e.target.value })}
                    className="w-full px-5 py-4 text-lg border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-base font-bold text-gray-700">종목</label>
                  <input
                    type="text"
                    value={editForm.businessCategory}
                    onChange={(e) => setEditForm({ ...editForm, businessCategory: e.target.value })}
                    className="w-full px-5 py-4 text-lg border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-bold"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="block text-base font-bold text-gray-700">사업장 주소</label>
                  <input
                    type="text"
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    className="w-full px-5 py-4 text-lg border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-bold"
                  />
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 섹션 2: 인증서 관리 */}
        <section className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="flex items-center gap-3 p-6 border-b border-gray-50 bg-gray-50/30">
            <ShieldCheck className="w-6 h-6 text-gray-400" />
            <h2 className="text-xl font-bold text-gray-900">인증서 관리</h2>
          </div>

          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="flex items-center gap-4">
                <span className="text-lg font-bold text-gray-500">공동인증서 상태</span>
                {isCertificateRegistered ? (
                  <div className="flex items-center gap-1.5 px-4 py-1.5 text-base font-black text-green-700 bg-green-100 rounded-full">
                    <Check className="w-4 h-4 stroke-[4px]" />
                    등록 완료
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-4 py-1.5 text-base font-black text-red-700 bg-red-100 rounded-full">
                    <AlertTriangle className="w-4 h-4 stroke-[4px]" />
                    미등록
                  </div>
                )}
              </div>
              <Link
                href="/cert"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-lg font-bold text-blue-600 border-2 border-blue-600 hover:bg-blue-600 hover:text-white rounded-2xl transition-all"
              >
                <ShieldCheck className="w-5 h-5" />
                {isCertificateRegistered ? "인증서 갱신/변경" : "인증서 등록하기"}
              </Link>
            </div>
            <p className="mt-4 text-base text-gray-400 font-medium">실제 팝빌 API를 통해 세금계산서를 발행하기 위해서는 사업자 공동인증서 등록이 필수입니다.</p>
          </div>
        </section>

        {/* 섹션 3: 계정 설정 */}
        <section className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="flex items-center gap-3 p-6 border-b border-gray-50 bg-gray-50/30">
            <Settings className="w-6 h-6 text-gray-400" />
            <h2 className="text-xl font-bold text-gray-900">계정 설정</h2>
          </div>

          <div className="p-4 space-y-2">
            <button
              className="w-full flex items-center gap-4 px-6 py-5 text-lg font-bold text-gray-700 hover:bg-gray-50 rounded-2xl transition-all text-left group"
            >
              <KeyRound className="w-6 h-6 text-gray-400 group-hover:text-blue-500" />
              비밀번호 변경
            </button>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-4 px-6 py-5 text-lg font-bold text-gray-700 hover:bg-gray-50 rounded-2xl transition-all text-left group"
            >
              <LogOut className="w-6 h-6 text-gray-400 group-hover:text-red-500" />
              로그아웃
            </button>

            <div className="pt-2 border-t border-gray-100 mt-2">
              <button
                onClick={() => setShowWithdrawConfirm(true)}
                className="w-full flex items-center gap-4 px-6 py-5 text-lg font-bold text-red-500 hover:bg-red-50 rounded-2xl transition-all text-left"
              >
                <UserX className="w-6 h-6" />
                회원 탈퇴 (서비스 이용 해지)
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* 회원 탈퇴 확인 모달 */}
      {showWithdrawConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="w-7 h-7 text-red-600" />
              </div>
              <h3 className="text-2xl font-black text-gray-900">회원 탈퇴</h3>
            </div>
            
            <p className="text-lg text-gray-600 mb-8 leading-relaxed font-medium">
              정말로 탈퇴하시겠습니까? 탈퇴 시 발행 내역, 거래처 목록 등 <span className="text-red-600 font-black">모든 데이터가 영구히 삭제</span>되며 복구할 수 없습니다.
            </p>
            
            <div className="flex gap-4">
              <button
                onClick={() => setShowWithdrawConfirm(false)}
                className="flex-1 px-6 py-4 text-lg font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-all"
              >
                취소
              </button>
              <button
                onClick={handleWithdraw}
                className="flex-1 px-6 py-4 text-lg font-bold text-white bg-red-600 hover:bg-red-700 rounded-2xl transition-all shadow-lg shadow-red-100"
              >
                탈퇴 승인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
