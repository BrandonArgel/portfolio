import type { LucideIcon } from 'lucide-react'

export type ServiceCategoryId = 'all' | 'frontend' | 'backend' | 'cloud'

export type ServiceItemKey =
  | 'frontend_development'
  | 'backend_development'
  | 'database_architecture'
  | 'full_stack_apps'
  | 'cloud_deployment'
  | 'performance_seo'

export type ServiceColor = 'blue' | 'purple' | 'emerald' | 'amber' | 'rose' | 'cyan'

export interface ServiceDefinition {
  key: ServiceItemKey
  category: Exclude<ServiceCategoryId, 'all'>
  icon: LucideIcon
  color?: ServiceColor
  href?: string
}

export interface ServiceCategoryTab {
  id: ServiceCategoryId
}
