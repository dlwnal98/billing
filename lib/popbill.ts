// API route에서만 사용. 클라이언트 컴포넌트 import 금지.
const popbill = require('popbill')
popbill.config({
  LinkID: process.env.POPBILL_LINK_ID!,
  SecretKey: process.env.POPBILL_SECRET_KEY!,
  IsTest: process.env.POPBILL_IS_TEST === 'true',
  defaultErrorHandler: (err: Error) => { console.error('팝빌 오류:', err) }
})
export const taxinvoiceService = popbill.TaxinvoiceService()
export default popbill
