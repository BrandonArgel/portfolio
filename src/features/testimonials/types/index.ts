export type TestimonialKey = 'sura_cedeno' | 'carlos_cespedes' | 'aaron_garibay' | 'joel_campos'

export interface TestimonialItem {
  key: TestimonialKey
  name: string
  company?: string
  linkedInUrl?: string
  avatarUrl?: string
  initials: string
}
