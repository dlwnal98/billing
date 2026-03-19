"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, FileText } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({})
  const [isLoading, setIsLoading] = useState(false)

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {}

    if (!email) {
      newErrors.email = "이메일 주소를 입력해주세요."
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "올바른 이메일 형식이 아닙니다."
    }

    if (!password) {
      newErrors.password = "비밀번호를 입력해주세요."
    } else if (password.length < 6) {
      newErrors.password = "비밀번호는 최소 6자 이상이어야 합니다."
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    setErrors({})

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setErrors({ general: "이메일 또는 비밀번호가 올바르지 않습니다." })
        return
      }
      
      router.push("/")
      router.refresh()
    } catch (err) {
      setErrors({ general: "이메일 또는 비밀번호가 올바르지 않습니다." })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-[480px]">
      {/* 서비스명 */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
          <FileText className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">세금계산서 발행</h1>
      </div>

      {/* 로그인 카드 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-xl font-semibold text-gray-900 text-center mb-6">
          로그인
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 일반 에러 메시지 */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-base">{errors.general}</p>
            </div>
          )}

          {/* 이메일 입력 */}
          <div>
            <label htmlFor="email" className="block text-lg font-medium text-gray-700 mb-2">
              이메일 주소
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }))
              }}
              placeholder="이메일을 입력해 주세요"
              className={`w-full px-4 py-3 text-lg border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                errors.email 
                  ? "border-red-400 bg-red-50" 
                  : "border-gray-300 bg-white hover:border-gray-400"
              }`}
              autoComplete="email"
            />
            {errors.email && (
              <p className="mt-2 text-base text-red-600">{errors.email}</p>
            )}
          </div>

          {/* 비밀번호 입력 */}
          <div>
            <label htmlFor="password" className="block text-lg font-medium text-gray-700 mb-2">
              비밀번호
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }))
                }}
                placeholder="비밀번호를 입력하세요"
                className={`w-full px-4 py-3 pr-12 text-lg border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  errors.password 
                    ? "border-red-400 bg-red-50" 
                    : "border-gray-300 bg-white hover:border-gray-400"
                }`}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-gray-700 transition-colors"
                aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보이기"}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-2 text-base text-red-600">{errors.password}</p>
            )}
          </div>

          {/* 로그인 버튼 */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 text-lg font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? "로그인 중..." : "로그인"}
          </button>

          {/* 비밀번호 찾기 */}
          <div className="text-center">
            <Link
              href="/forgot-password"
              className="text-base text-gray-600 hover:text-blue-600 hover:underline transition-colors"
            >
              비밀번호를 잊으셨나요?
            </Link>
          </div>
        </form>

        {/* 구분선 */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-4 text-base text-gray-500">또는</span>
          </div>
        </div>

        {/* 회원가입 안내 */}
        <div className="text-center">
          <p className="text-base text-gray-600">
            아직 계정이 없으신가요?{" "}
            <Link
              href="/signup"
              className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
            >
              회원가입
            </Link>
          </p>
        </div>
      </div>

      {/* 하단 안내 */}
      <p className="mt-6 text-center text-sm text-gray-500">
        로그인 시 서비스 이용약관 및 개인정보처리방침에 동의합니다.
      </p>
    </div>
  )
}
