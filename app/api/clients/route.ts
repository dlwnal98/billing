import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { getAuthUser } from "@/lib/auth-helper"
import { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { dbUser } = await getAuthUser(request)
    if (!dbUser) {
      return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")

    let query = supabaseAdmin
      .from("clients")
      .select("*")
      .eq("user_id", dbUser.id)
      .order("created_at", { ascending: false })

    if (search) {
      query = query.or(`corp_name.ilike.%${search}%,corp_num.ilike.%${search}%`)
    }

    const { data: clients, error } = await query

    if (error) throw error

    // DB 스네이크 케이스를 카멜 케이스로 변환 (필요시)
    const formattedClients = clients.map(c => ({
      id: c.id,
      userId: c.user_id,
      corpName: c.corp_name,
      corpNum: c.corp_num,
      ceoName: c.ceo_name,
      email: c.email,
      createdAt: c.created_at
    }))

    return NextResponse.json({ clients: formattedClients })
  } catch (err) {
    console.error("거래처 조회 오류:", err)
    return NextResponse.json({ message: "거래처를 불러오는 중 오류가 발생했습니다." }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { dbUser } = await getAuthUser(request as NextRequest)
    if (!dbUser) {
      return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 })
    }

    const body = await request.json()
    const { corpName, corpNum, ceoName, email } = body

    if (!corpName || !corpNum) {
      return NextResponse.json({ message: "거래처 이름과 사업자번호를 입력해 주세요." }, { status: 400 })
    }

    const { data: client, error } = await supabaseAdmin
      .from("clients")
      .insert({
        user_id: dbUser.id,
        corp_name: corpName,
        corp_num: corpNum,
        ceo_name: ceoName,
        email: email,
      })
      .select()
      .single()

    if (error) {
      console.error("거래처 추가 오류:", error)
      return NextResponse.json({ message: "거래처 추가 중 오류가 발생했습니다." }, { status: 500 })
    }

    const formattedClient = {
      id: client.id,
      userId: client.user_id,
      corpName: client.corp_name,
      corpNum: client.corp_num,
      ceoName: client.ceo_name,
      email: client.email,
      createdAt: client.created_at
    }

    return NextResponse.json({ client: formattedClient, message: "거래처가 추가되었습니다." })
  } catch (err) {
    console.error("서버 오류:", err)
    return NextResponse.json({ message: "서버 내부 오류가 발생했습니다." }, { status: 500 })
  }
}
