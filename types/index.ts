export interface User {
  id: string
  email: string
  corpNum: string
  corpName: string
  ceoName: string
  bizType: string
  bizClass: string
  address: string
  popbillId: string | null
  certRegistered: boolean
  preferredInputMode: 'card' | 'grid'
  createdAt: string
}

export interface Client {
  id: string
  userId: string
  corpName: string
  corpNum: string
  ceoName: string | null
  email: string | null
  createdAt: string
}

export interface InvoiceItem {
  receiverCorpName: string
  receiverCorpNum: string
  receiverCeoName: string
  receiverEmail: string
  writeDate: string
  itemName: string
  supplyCost: number
  tax: number
  remark: string
}

export interface Taxinvoice {
  id: string
  userId: string
  clientId: string | null
  writeDate: string
  supplyCost: number
  tax: number
  totalAmount: number
  remark: string | null
  receiverCorpName: string
  receiverCorpNum: string
  receiverCeoName: string | null
  receiverEmail: string | null
  popbillMgtkey: string | null
  ntsConfirmNum: string | null
  sendState: '전송완료' | '전송대기' | '오류'
  sendAt: string | null
  inputMode: 'card' | 'grid' | null
  createdAt: string
}

export interface InvoiceFormItem {
  id: string
  writeDate: string
  itemName: string
  supplyCost: string
  tax: string
  remark: string
}

export interface ClientGroup {
  id: string
  clientId: string | null
  corpName: string
  corpNum: string
  ceoName: string
  email: string
  saveToClients: boolean
  invoices: InvoiceFormItem[]
}

export interface ApiResponse<T = null> {
  message: string
  data?: T
  error?: string
}
