import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { getAuthUser } from "@/lib/auth-helper"
import { taxinvoiceService } from "@/lib/popbill"
import { NextRequest } from "next/server"
import crypto from 'crypto'
import { InvoiceItem } from "@/types"

export async function POST(request: NextRequest) {
  try {
    const { dbUser } = await getAuthUser(request)
    if (!dbUser) {
      return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 })
    }

    if (!dbUser.certRegistered) {
      return NextResponse.json({ message: "공동인증서를 먼저 등록해 주세요." }, { status: 400 })
    }

    const body = await request.json()
    const { items }: { items: InvoiceItem[] } = body

    if (!items || items.length === 0) {
      return NextResponse.json({ message: "발행할 내용이 없습니다." }, { status: 400 })
    }

    let successCount = 0

    for (const item of items) {
      // 유효성 검사
      if (!item.receiverCorpName || !item.receiverCorpNum || !item.itemName || item.supplyCost <= 0) {
        console.warn("유효하지 않은 항목 건너뜀:", item)
        continue
      }

      const mgtKey = crypto.randomUUID().replace(/-/g, '').substring(0, 24)

      const taxinvoice = {
        writeDate: item.writeDate.replace(/-/g, ''),
        chargeDirection: '정과금',
        issueType: '정발행',
        taxType: '과세',
        invoicerCorpNum: dbUser.corpNum,
        invoicerCorpName: dbUser.corpName,
        invoicerCEOName: dbUser.ceoName,
        invoiceeType: '사업자',
        invoiceeCorpNum: item.receiverCorpNum.replace(/-/g, ''),
        invoiceeCorpName: item.receiverCorpName,
        invoiceeCEOName: item.receiverCeoName,
        invoiceeEmail1: item.receiverEmail,
        supplyCostTotal: String(item.supplyCost),
        taxTotal: String(item.tax),
        totalAmount: String(item.supplyCost + item.tax),
        remark1: item.remark,
        detailList: [{
          serialNum: 1,
          itemName: item.itemName,
          qty: "1",
          unitCost: String(item.supplyCost),
          supplyCost: String(item.supplyCost),
          tax: String(item.tax)
        }]
      }

      try {
        // 팝빌 발행
        await new Promise((resolve, reject) => {
          taxinvoiceService.RegistIssue(dbUser.corpNum, taxinvoice, mgtKey, "", false, "",
            (result: { code: number; message: string }) => {
              if (result && result.code === 1) resolve(result)
              else reject(new Error(result?.message || "발행 실패"))
            }
          )
        })

        // Supabase DB 저장
        const { error: dbError } = await supabaseAdmin
          .from("taxinvoices")
          .insert({
            user_id: dbUser.id,
            write_date: item.writeDate,
            supply_cost: item.supplyCost,
            tax: item.tax,
            total_amount: item.supplyCost + item.tax,
            remark: item.remark,
            receiver_corp_name: item.receiverCorpName,
            receiver_corp_num: item.receiverCorpNum.replace(/-/g, ''),
            receiver_ceo_name: item.receiverCeoName,
            receiver_email: item.receiverEmail,
            popbill_mgtkey: mgtKey,
            send_state: '전송완료',
            send_at: new Date().toISOString()
          })

        if (dbError) {
          console.error("DB 저장 오류:", dbError)
        } else {
          successCount++
        }
      } catch (err) {
        console.error("발행 실패:", err)
      }
    }

    return NextResponse.json({ message: `${successCount}건이 발행되었습니다.`, successCount })
  } catch (err) {
    console.error("서버 오류:", err)
    return NextResponse.json({ message: "서버 내부 오류가 발생했습니다." }, { status: 500 })
  }
}
