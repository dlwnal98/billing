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

    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const startDate = firstDay.toISOString().split('T')[0]

    // 1. 이번 달 집계
    const { data: monthData, error: statsError } = await supabaseAdmin
      .from("taxinvoices")
      .select("supply_cost, tax")
      .eq("user_id", dbUser.id)
      .gte("write_date", startDate)

    if (statsError) throw statsError

    const thisMonth = {
      count: monthData?.length || 0,
      supplyCostTotal: monthData?.reduce((acc, item) => acc + (item.supply_cost || 0), 0) || 0,
      taxTotal: monthData?.reduce((acc, item) => acc + (item.tax || 0), 0) || 0
    }

    // 2. 최근 5건 (created_at 내림차순)
    const { data: recentData, error: recentError } = await supabaseAdmin
      .from("taxinvoices")
      .select("id, write_date, receiver_corp_name, total_amount, send_state")
      .eq("user_id", dbUser.id)
      .order("created_at", { ascending: false })
      .limit(5)

    if (recentError) throw recentError

    const recent = recentData?.map(inv => ({
      id: inv.id,
      writeDate: inv.write_date,
      receiverCorpName: inv.receiver_corp_name,
      totalAmount: inv.total_amount,
      sendState: inv.send_state
    })) || []

    return NextResponse.json({
      thisMonth,
      recent,
      certRegistered: dbUser.certRegistered || false
    })
  } catch (err) {
    console.error("대시보드 조회 오류:", err)
    return NextResponse.json({ message: "대시보드 데이터를 불러오는 중 오류가 발생했습니다." }, { status: 500 })
  }
}
