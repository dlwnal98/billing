export interface Client {
  id: string
  name: string
  businessNumber: string
  representative: string
  email: string
}

export interface InvoiceItem {
  id: string
  issueDate: string
  itemName: string
  supplyAmount: number
  taxAmount: number
  note: string
}

export interface ClientTab {
  id: string
  label: string
  client: Client | null
  isDirectInput: boolean
  directInputData: Partial<Client> & { saveToList?: boolean }
  items: InvoiceItem[]
}

export type InputMode = "single" | "multiple"
