import { BookOpen, Code2, Shield } from 'lucide-react'
import type { SkillCategoryConfig } from '../types'

export const ABOUT_SKILL_CATEGORIES: SkillCategoryConfig[] = [
  {
    key: 'frontend',
    icon: Shield,
  },
  {
    key: 'backend',
    icon: Code2,
  },
  {
    key: 'fullstack',
    icon: BookOpen,
  },
]
