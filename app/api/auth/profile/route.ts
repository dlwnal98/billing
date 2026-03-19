import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { getAuthUser } from "@/lib/auth-helper"
import { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { supabaseUser, dbUser } = await getAuthUser(request)
    if (!supabaseUser || !dbUser) {
      return NextResponse.json({ message: "인증되지 않은 사용자입니다." }, { status: 401 })
    }

    return NextResponse.json({ user: dbUser })
  } catch (err) {
    console.error("프로필 조회 오류:", err)
    return NextResponse.json({ message: "서버 오류" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { supabaseUser } = await getAuthUser(request)
    if (!supabaseUser) {
      return NextResponse.json({ message: "인증되지 않은 사용자입니다." }, { status: 401 })
    }

    const { corpName, ceoName, bizType, bizClass, address } = await request.json()

    const { error: updateError } = await supabaseAdmin
      .from("users")
      .update({
        corp_name: corpName,
        ceo_name: ceoName,
        biz_type: bizType,
        biz_class: bizClass,
        address: address,
      })
      .eq("id", supabaseUser.id)

    if (updateError) throw updateError

    return NextResponse.json({ message: "정보가 수정되었습니다." })
  } catch (err) {
    console.error("프로필 수정 오류:", err)
    return NextResponse.json({ message: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}
