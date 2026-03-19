import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { getAuthUser } from "@/lib/auth-helper"
import { NextRequest } from "next/server"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { dbUser } = await getAuthUser(request)
    if (!dbUser) {
      return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 })
    }

    const { corpName, corpNum, ceoName, email } = await request.json()

    if (!corpName || !corpNum) {
      return NextResponse.json({ message: "거래처 이름과 사업자번호를 입력해 주세요." }, { status: 400 })
    }

    // 본인 거래처인지 확인하고 업데이트
    const { data: updatedClient, error } = await supabaseAdmin
      .from("clients")
      .update({
        corp_name: corpName,
        corp_num: corpNum,
        ceo_name: ceoName,
        email: email,
      })
      .eq("id", id)
      .eq("user_id", dbUser.id)
      .select()
      .single()

    if (error) {
      console.error("거래처 수정 오류:", error)
      return NextResponse.json({ message: "거래처 수정 중 오류가 발생했습니다." }, { status: 500 })
    }

    return NextResponse.json({ client: updatedClient, message: "거래처가 수정되었습니다." })
  } catch (err) {
    console.error("서버 오류:", err)
    return NextResponse.json({ message: "서버 내부 오류가 발생했습니다." }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { dbUser } = await getAuthUser(request)
    if (!dbUser) {
      return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 })
    }

    // 본인 거래처인지 확인하고 삭제
    const { error } = await supabaseAdmin
      .from("clients")
      .delete()
      .eq("id", id)
      .eq("user_id", dbUser.id)

    if (error) {
      console.error("거래처 삭제 오류:", error)
      return NextResponse.json({ message: "거래처 삭제 중 오류가 발생했습니다." }, { status: 500 })
    }

    return NextResponse.json({ message: "거래처가 삭제되었습니다." })
  } catch (err) {
    console.error("서버 오류:", err)
    return NextResponse.json({ message: "서버 내부 오류가 발생했습니다." }, { status: 500 })
  }
}
