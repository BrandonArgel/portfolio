import type { ElementType } from 'react'

export type SkillCategoryKey = 'frontend' | 'backend' | 'fullstack'

export interface SkillCategoryConfig {
  key: SkillCategoryKey
  icon: ElementType
}

export interface AboutCardContent {
  title: string
  description: string
  skills: string[]
}
