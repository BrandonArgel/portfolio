import { BookOpen, Code2, Heart, HeartHandshake, Rocket, Shield, Target, Users } from 'lucide-react'
import type { PhilosophyItemConfig, SkillCategoryConfig } from '../types'

export const ABOUT_SKILL_CATEGORIES: SkillCategoryConfig[] = [
  {
    key: 'frontend',
    title: {
      en: 'Frontend Engineering',
      es: 'Ingeniería Frontend',
    },
    icon: Shield,
    skills: [
      'React & React 19',
      'Next.js App Router',
      'TypeScript',
      'Tailwind CSS',
      'State Management',
      'Responsive & Accessible Design',
    ],
  },
  {
    key: 'backend',
    title: {
      en: 'Backend & APIs',
      es: 'Backend y APIs',
    },
    icon: Code2,
    skills: [
      'Node.js & Bun',
      'REST & GraphQL APIs',
      'PostgreSQL',
      'Drizzle ORM & Prisma',
      'Server Actions',
      'End-to-End Type Safety',
    ],
  },
  {
    key: 'fullstack',
    title: {
      en: 'Full Stack Mastery',
      es: 'Dominio Full Stack',
    },
    icon: BookOpen,
    skills: [
      'Architecture & System Design',
      'Authentication (Better Auth)',
      'Error Handling & Resilience',
      'CI/CD & Cloud Deployment',
      'Performance & SEO',
      'Testing & Code Quality',
    ],
  },
]

export const ABOUT_PHILOSOPHY_PRINCIPLES: PhilosophyItemConfig[] = [
  {
    key: 'learn_document_share',
    icon: BookOpen,
    color: 'blue',
  },
  {
    key: 'build_parachute',
    icon: Rocket,
    color: 'purple',
  },
  {
    key: 'design_for_diversity',
    icon: Users,
    color: 'emerald',
  },
  {
    key: 'communicate_kindness',
    icon: HeartHandshake,
    color: 'amber',
  },
  {
    key: 'focus_controllable',
    icon: Target,
    color: 'cyan',
  },
  {
    key: 'care_human_factor',
    icon: Heart,
    color: 'rose',
  },
]
