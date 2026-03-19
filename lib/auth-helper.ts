import { supabaseAdmin } from './supabase-admin'
import { NextRequest, NextResponse } from 'next/server'
import type { User } from '@/types'

export async function getAuthUser(request: NextRequest): Promise<{
  supabaseUser: { id: string; email: string } | null
  dbUser: User | null
}> {
  try {
    const token = request.headers.get('Authorization')?.substring(7)
    if (!token) return { supabaseUser: null, dbUser: null }
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
    if (error || !user) return { supabaseUser: null, dbUser: null }
    const { data: rawUser } = await supabaseAdmin
      .from('users').select('*').eq('id', user.id).single()
    
    if (!rawUser) return { supabaseUser: { id: user.id, email: user.email! }, dbUser: null }

    const dbUser: User = {
      id: rawUser.id,
      email: rawUser.email,
      corpNum: rawUser.corp_num,
      corpName: rawUser.corp_name,
      ceoName: rawUser.ceo_name,
      bizType: rawUser.biz_type,
      bizClass: rawUser.biz_class,
      address: rawUser.address,
      popbillId: rawUser.popbill_id,
      certRegistered: rawUser.cert_registered,
      preferredInputMode: rawUser.preferred_input_mode,
      createdAt: rawUser.created_at
    }

    return {
      supabaseUser: { id: user.id, email: user.email! },
      dbUser
    }
  } catch {
    return { supabaseUser: null, dbUser: null }
  }
}

export const unauthorizedResponse = () =>
  NextResponse.json({ message: '로그인이 필요합니다.' }, { status: 401 })
