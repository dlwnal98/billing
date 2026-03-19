import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { getAuthUser } from "@/lib/auth-helper"
import { taxinvoiceService } from "@/lib/popbill"
import { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { supabaseUser } = await getAuthUser(request)
    if (!supabaseUser) {
      return NextResponse.json({ message: "인증되지 않은 사용자입니다." }, { status: 401 })
    }

    const body = await request.json()
    const { corpNum, corpName, ceoName, bizType, bizClass, address } = body

    if (!corpNum || !corpName) {
      return NextResponse.json({ message: "필수 정보가 누락되었습니다." }, { status: 400 })
    }

    // 1. Supabase users 테이블에 저장
    const { error: dbError } = await supabaseAdmin
      .from("users")
      .insert({
        id: supabaseUser.id,
        email: supabaseUser.email,
        corp_num: corpNum,
        corp_name: corpName,
        ceo_name: ceoName,
        biz_type: bizType,
        biz_class: bizClass,
        address: address,
        cert_registered: false,
        preferred_input_mode: 'card'
      })

    if (dbError) {
      console.error("DB 가입 오류:", dbError)
      return NextResponse.json({ message: "데이터베이스 저장 중 오류가 발생했습니다." }, { status: 500 })
    }

    // 2. 팝빌 JoinMember 호출
    try {
      await new Promise((resolve, reject) => {
        taxinvoiceService.JoinMember({
          Addr: address,
          BizType: bizType,
          BizClass: bizClass,
          CEOName: ceoName,
          CorpName: corpName,
          CorpNum: corpNum,
          ID: supabaseUser.id,
          Email: supabaseUser.email,
        }, (result: { code: number; message: string }) => {
          if (result && result.code === 1) resolve(result)
          else reject(result)
        })
      })
    } catch (popbillErr) {
      console.error("팝빌 가입 시도 완료 (무시 가능):", popbillErr)
      // 문제 발생 시 로그만 남기고 가입 절차는 계속 진행 (사용자 요구사항)
    }

    return NextResponse.json({ message: "가입이 완료되었습니다." })
  } catch (err) {
    console.error("가입 서버 오류:", err)
    return NextResponse.json({ message: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}
