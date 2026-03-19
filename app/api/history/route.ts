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
    const now = new Date()
    const year = searchParams.get("year") || String(now.getFullYear())
    const month = searchParams.get("month") || String(now.getMonth() + 1).padStart(2, '0')
    const search = searchParams.get("search")
    const status = searchParams.get("status")

    const startDate = `${year}-${month.padStart(2, '0')}-01`
    const lastDay = new Date(Number(year), Number(month), 0).getDate()
    const endDate = `${year}-${month.padStart(2, '0')}-${lastDay}`

    let query = supabaseAdmin
      .from("taxinvoices")
      .select("*")
      .eq("user_id", dbUser.id)
      .gte("write_date", startDate)
      .lte("write_date", endDate)
      .order("write_date", { ascending: false })

    if (search) {
      query = query.ilike("receiver_corp_name", `%${search}%`)
    }

    if (status) {
      query = query.eq("send_state", status)
    }

    const { data: items, error } = await query

    if (error) throw error

    const summary = {
      count: items.length,
      supplyCostTotal: items.reduce((acc, item) => acc + (item.supply_cost || 0), 0),
      taxTotal: items.reduce((acc, item) => acc + (item.tax || 0), 0)
    }

    // DB 스네이크 케이스를 카멜 케이스로 변환 (타입 정의에 맞춤)
    const formattedItems = items.map(item => ({
      id: item.id,
      userId: item.user_id,
      writeDate: item.write_date,
      supplyCost: item.supply_cost,
      tax: item.tax,
      totalAmount: item.total_amount,
      remark: item.remark,
      receiverCorpName: item.receiver_corp_name,
      receiverCorpNum: item.receiver_corp_num,
      receiverCeoName: item.receiver_ceo_name,
      receiverEmail: item.receiver_email,
      popbillMgtkey: item.popbill_mgtkey,
      ntsConfirmNum: item.nts_confirm_num,
      sendState: item.send_state,
      sendAt: item.send_at,
      createdAt: item.created_at
    }))

    return NextResponse.json({ items: formattedItems, summary })
  } catch (err) {
    console.error("이력 조회 오류:", err)
    return NextResponse.json({ message: "데이터를 불러오는 중 오류가 발생했습니다." }, { status: 500 })
  }
}
