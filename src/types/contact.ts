export interface ContactMessagePayload {
  name: string
  email: string
  subject: string
  message: string
}

export interface ContactInfoItem {
  id: string
  label: string
  value: string
  href?: string
  isCopyable?: boolean
}
