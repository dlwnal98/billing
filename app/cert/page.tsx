"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ShieldCheck, Upload, File, Eye, EyeOff, CheckCircle2, ArrowLeft } from "lucide-react"
import { useApi } from "@/hooks/useApi"

export default function CertPage() {
  const router = useRouter()
  const { apiFetch, loading, error: apiError } = useApi()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [localError, setLocalError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const extension = file.name.toLowerCase().split('.').pop()
      if (extension === 'pfx' || extension === 'p12') {
        setSelectedFile(file)
        setLocalError("")
      } else {
        setLocalError("지원하지 않는 파일 형식입니다. .pfx 또는 .p12 파일만 등록 가능합니다.")
        setSelectedFile(null)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError("")
    
    if (!selectedFile) {
      setLocalError("인증서 파일을 선택해주세요.")
      return
    }
    
    if (!password) {
      setLocalError("인증서 비밀번호를 입력해주세요.")
      return
    }

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)
      formData.append("password", password)

      await apiFetch("/api/cert", {
        method: "POST",
        body: formData,
      })
      
      setIsSuccess(true)
      setTimeout(() => {
        router.push("/")
      }, 2000)
    } catch (err) {
      // Error is handled by useApi
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            인증서가 성공적으로 등록되었습니다!
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            이제 간편하게 세금계산서를 발행할 수 있습니다.
          </p>
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center justify-center gap-2 w-full px-6 py-4 text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 max-w-xl mx-auto pb-24 md:pb-8">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-lg text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        홈으로 돌아가기
      </Link>

      <header className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-blue-100 rounded-xl">
            <ShieldCheck className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">인증서 등록</h1>
        </div>
        <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
          <p className="text-lg text-blue-800 leading-relaxed">
            공동인증서를 한 번만 등록해 두시면, 이후엔 버튼 하나로 세금계산서가 자동 발행됩니다.
          </p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-3">
          <label className="block text-lg font-medium text-gray-900">
            인증서 파일 선택 (.pfx, .p12)
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pfx,.p12"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          {!selectedFile ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex flex-col items-center justify-center gap-3 px-6 py-8 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50/50 transition-colors"
            >
              <Upload className="w-10 h-10 text-gray-400" />
              <span className="text-lg text-gray-600">파일을 선택하세요</span>
            </button>
          ) : (
            <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-xl">
              <div className="flex items-center gap-3">
                <File className="w-6 h-6 text-blue-600" />
                <span className="text-lg text-gray-900">{selectedFile.name}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                className="px-3 py-1 text-base text-gray-500 hover:text-gray-700"
              >
                변경
              </button>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <label htmlFor="password" className="block text-lg font-medium text-gray-900">
            인증서 비밀번호
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력해 주세요"
              className="w-full px-4 py-4 pr-12 text-lg border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {(localError || apiError) && (
          <p className="text-lg text-red-600">
            {localError || apiError}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-4 text-xl font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-xl transition-colors"
        >
          {loading ? "등록 중..." : "등록하기"}
        </button>
      </form>
    </div>
  )
}
