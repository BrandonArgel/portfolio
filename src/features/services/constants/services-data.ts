import { Cloud, Database, Globe, Layers, Server, Zap } from 'lucide-react'
import type { ServiceCategoryTab, ServiceColor, ServiceDefinition } from '../types'

export const COLOR_SEQUENCE: readonly ServiceColor[] = [
  'blue',
  'purple',
  'emerald',
  'amber',
  'rose',
  'cyan',
] as const

export function getServiceColor(color?: ServiceColor, index?: number): ServiceColor {
  if (color) return color
  if (typeof index === 'number') {
    return COLOR_SEQUENCE[index % COLOR_SEQUENCE.length]
  }
  return 'blue'
}

export const SERVICE_CATEGORIES: ServiceCategoryTab[] = [
  { id: 'all' },
  { id: 'frontend' },
  { id: 'backend' },
  { id: 'cloud' },
]

export const SERVICES_LIST: ServiceDefinition[] = [
  {
    key: 'frontend_development',
    category: 'frontend',
    icon: Globe,
    color: 'blue',
    href: '/contact',
  },
  {
    key: 'backend_development',
    category: 'backend',
    icon: Server,
    color: 'purple',
    href: '/contact',
  },
  {
    key: 'full_stack_apps',
    category: 'cloud',
    icon: Layers,
    color: 'amber',
    href: '/contact',
  },
  {
    key: 'performance_seo',
    category: 'frontend',
    icon: Zap,
    color: 'cyan',
    href: '/contact',
  },
  {
    key: 'database_architecture',
    category: 'backend',
    icon: Database,
    color: 'emerald',
    href: '/contact',
  },
  {
    key: 'cloud_deployment',
    category: 'cloud',
    icon: Cloud,
    color: 'rose',
    href: '/contact',
  },
]
