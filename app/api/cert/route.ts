import { NextResponse } from "next/server"
import { taxinvoiceService } from "@/lib/popbill"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { getAuthUser } from "@/lib/auth-helper"
import { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { supabaseUser, dbUser } = await getAuthUser(request)
    if (!supabaseUser || !dbUser) {
      return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const password = formData.get("password") as string

    if (!file || !password) {
      return NextResponse.json({ message: "인증서 파일을 선택해 주세요." }, { status: 400 })
    }

    const fileName = file.name.toLowerCase()
    if (!fileName.endsWith(".pfx") && !fileName.endsWith(".p12")) {
      return NextResponse.json({ message: "pfx 또는 p12 파일만 업로드 가능합니다." }, { status: 400 })
    }

    // 1. 파일 → base64
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const certBase64 = buffer.toString("base64")

    // 2. 팝빌 인증서 등록 호출 (Promise 래핑)
    try {
      await new Promise((resolve, reject) => {
        taxinvoiceService.RegistCert(dbUser.corpNum, certBase64, password,
          (result: { code: number; message: string }) => {
            if (result && result.code === 1) resolve(result)
            else reject(new Error(result?.message || "비밀번호 오류 가이드 없음"))
          }
        )
      })
    } catch (popbillErr: unknown) {
      console.error("팝빌 인증서 등록 실패:", popbillErr)
      const errorMsg = (popbillErr as Error)?.message || ""
      if (errorMsg.includes("비밀번호")) {
        return NextResponse.json({ message: "인증서 비밀번호가 올바르지 않습니다." }, { status: 400 })
      }
      return NextResponse.json({ message: "인증서 등록에 실패했습니다. 다시 시도해 주세요." }, { status: 500 })
    }

    // 3. 성공 시 DB 업데이트
    const { error: dbError } = await supabaseAdmin
      .from("users")
      .update({ cert_registered: true })
      .eq("id", supabaseUser.id)

    if (dbError) throw dbError

    return NextResponse.json({ message: "인증서가 등록되었습니다." })
  } catch (err) {
    console.error("서버 내부 오류:", err)
    return NextResponse.json({ message: "인증서 등록 중 오류가 발생했습니다." }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { supabaseUser, dbUser } = await getAuthUser(request)
    if (!supabaseUser || !dbUser) {
      return NextResponse.json({ message: "인증되지 않은 사용자입니다." }, { status: 401 })
    }

    return NextResponse.json({ certRegistered: dbUser.certRegistered || false })
  } catch (err) {
    return NextResponse.json({ message: "서버 오류" }, { status: 500 })
  }
}
