'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

interface FetchOptions extends Omit<RequestInit, 'body'> {
  body?: Record<string, unknown> | FormData
}

export function useApi() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const apiFetch = async <T>(url: string, options: FetchOptions = {}): Promise<T> => {
    setLoading(true)
    setError(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      const isFormData = options.body instanceof FormData
      const headers: HeadersInit = {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      }
      const body = isFormData
        ? options.body as FormData
        : options.body ? JSON.stringify(options.body) : undefined
      const res = await fetch(url, { ...options, headers, body })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || '오류가 발생했습니다.')
      return data as T
    } catch (err) {
      const message = err instanceof Error ? err.message : '오류가 발생했습니다.'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { apiFetch, loading, error, clearError: () => setError(null) }
}
