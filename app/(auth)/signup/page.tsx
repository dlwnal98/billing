"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FileText, ArrowLeft } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [corpNum, setCorpNum] = useState("")
  const [corpName, setCorpName] = useState("")
  const [ceoName, setCeoName] = useState("")
  const [bizType, setBizType] = useState("")
  const [bizClass, setBizClass] = useState("")
  const [address, setAddress] = useState("")
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const formatCorpNum = (v: string) => {
    const n = v.replace(/[^0-9]/g, '')
    if (n.length <= 3) return n
    if (n.length <= 5) return n.slice(0,3) + '-' + n.slice(3)
    return n.slice(0,3) + '-' + n.slice(3,5) + '-' + n.slice(5,10)
  }

  const handleCorpNumChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCorpNum(formatCorpNum(e.target.value))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.")
      return
    }

    if (corpNum.replace(/-/g, '').length !== 10) {
      setError("올바른 사업자등록번호를 입력해주세요.")
      return
    }

    setIsLoading(true)

    try {
      // 1. Supabase Auth 가입
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) throw new Error(authError.message === "User already registered" ? "이미 가입된 이메일입니다." : authError.message)
      if (!authData.user) throw new Error("가입 처리 중 오류가 발생했습니다.")

      // 2. 비즈니스 정보 저장 (API 호출)
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: authData.user.id,
          email,
          corpNum: corpNum.replace(/-/g, ''),
          corpName,
          ceoName,
          bizType,
          bizClass,
          address,
        }),
      })

      const result = await res.json()
      if (!res.ok) throw new Error(result.message || "사업자 정보 저장에 실패했습니다.")

      // 3. 인증서 등록 페이지로 이동
      router.push("/cert")
    } catch (err) {
      setError(err instanceof Error ? err.message : "가입 중 오류가 발생했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-[600px] py-12">
      <Link href="/login" className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        로그인으로 돌아가기
      </Link>

      <div className="flex items-center justify-center gap-3 mb-8">
        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
          <FileText className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">회원가입</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-base font-semibold text-gray-700">이메일</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="이메일을 입력해 주세요"
              />
            </div>
            <div className="space-y-2">
              <label className="text-base font-semibold text-gray-700">사업자등록번호</label>
              <input
                type="text"
                required
                value={corpNum}
                onChange={handleCorpNumChange}
                maxLength={12}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="000-00-00000"
              />
            </div>
            <div className="space-y-2">
              <label className="text-base font-semibold text-gray-700">비밀번호</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="6자 이상 입력"
              />
            </div>
            <div className="space-y-2">
              <label className="text-base font-semibold text-gray-700">비밀번호 확인</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="비밀번호 다시 입력"
              />
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">상호 및 사업자 정보</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-base font-semibold text-gray-700">상호(법인명)</label>
                <input
                  type="text"
                  required
                  value={corpName}
                  onChange={(e) => setCorpName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-base font-semibold text-gray-700">대표자명</label>
                <input
                  type="text"
                  required
                  value={ceoName}
                  onChange={(e) => setCeoName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-base font-semibold text-gray-700">업태</label>
                <input
                  type="text"
                  required
                  value={bizType}
                  onChange={(e) => setBizType(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-base font-semibold text-gray-700">업종</label>
                <input
                  type="text"
                  required
                  value={bizClass}
                  onChange={(e) => setBizClass(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-base font-semibold text-gray-700">사업장 주소</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 text-xl font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
          >
            {isLoading ? "가입 처리 중..." : "회원가입 완료"}
          </button>
        </form>
      </div>
    </div>
  )
}
