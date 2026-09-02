import type { ElementType } from 'react'
import type { CardColor } from '@/components/ui/card-variants'

export type SkillCategoryKey = 'frontend' | 'backend' | 'fullstack'

export interface SkillCategoryConfig {
  key: SkillCategoryKey
  title: {
    en: string
    es: string
  }
  icon: ElementType
  skills: string[]
}

export type PhilosophyItemKey =
  | 'learn_document_share'
  | 'build_parachute'
  | 'design_for_diversity'
  | 'communicate_kindness'
  | 'focus_controllable'
  | 'care_human_factor'

export interface PhilosophyItemConfig {
  key: PhilosophyItemKey
  icon: ElementType
  color: CardColor
}
