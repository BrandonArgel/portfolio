import { Code2, Layers, Server } from 'lucide-react'
import type { HeroFeatureConfig } from '../types'

export const ROTATION_INTERVAL_MS = 3000

export const HERO_FEATURES: HeroFeatureConfig[] = [
  {
    key: 'frontend_development',
    icon: Code2,
    position: '-rotate-6 absolute top-0 left-5',
    colors: {
      iconBg: 'bg-blue-500/10',
      iconText: 'text-blue-400',
    },
  },
  {
    key: 'backend_architecture',
    icon: Server,
    position: 'rotate-6 absolute top-20 right-5',
    colors: {
      iconBg: 'bg-purple-500/10',
      iconText: 'text-purple-400',
    },
  },
  {
    key: 'full_stack_solutions',
    icon: Layers,
    position: '-rotate-2 absolute bottom-4 left-[20%]',
    colors: {
      iconBg: 'bg-emerald-500/10',
      iconText: 'text-emerald-400',
    },
  },
]
