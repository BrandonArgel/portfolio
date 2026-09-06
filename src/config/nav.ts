import {
  BookOpen,
  Code2,
  FileText,
  GraduationCap,
  Home,
  Layers,
  Mail,
  Moon,
  Sparkles,
  Sun,
  User,
} from 'lucide-react'

import type messages from '@/messages/en.json'

export type NavSectionColor = 'emerald' | 'purple' | 'blue' | 'cyan' | 'default'

type NavMessages = typeof messages.components.nav
export type NavMessageKey = keyof NavMessages

export type SubItem = {
  titleKey: NavMessageKey
  href: string
  descriptionKey: NavMessageKey
  icon?: React.ElementType
}

export type NavItem = {
  titleKey: NavMessageKey
  color?: NavSectionColor
  href?: string
  icon?: React.ElementType
  items?: SubItem[]
}

export const navConfig: NavItem[] = [
  {
    titleKey: 'home',
    href: '/',
    icon: Home,
  },
  {
    titleKey: 'about_section',
    color: 'blue',
    items: [
      {
        titleKey: 'about',
        href: '/about',
        descriptionKey: 'about_description',
        icon: User,
      },
      {
        titleKey: 'resume',
        href: '/resume',
        descriptionKey: 'resume_description',
        icon: FileText,
      },
      {
        titleKey: 'contact',
        href: '/contact',
        descriptionKey: 'contact_description',
        icon: Mail,
      },
    ],
  },
  {
    titleKey: 'content_section',
    color: 'cyan',
    items: [
      {
        titleKey: 'blog',
        href: '/blog',
        descriptionKey: 'blog_description',
        icon: BookOpen,
      },
      {
        titleKey: 'courses',
        href: '/courses',
        descriptionKey: 'courses_description',
        icon: GraduationCap,
      },
    ],
  },
  {
    titleKey: 'resources_section',
    color: 'emerald',
    items: [
      {
        titleKey: 'snippets',
        href: '/resources/snippets',
        descriptionKey: 'snippets_description',
        icon: Code2,
      },
      {
        titleKey: 'tools',
        href: '/resources/tools',
        descriptionKey: 'tools_description',
        icon: Layers,
      },
    ],
  },
  {
    titleKey: 'services_section',
    color: 'purple',
    items: [
      {
        titleKey: 'web_development',
        href: '/services/web-development',
        descriptionKey: 'web_development_description',
        icon: Sparkles,
      },
      {
        titleKey: 'full_stack_development',
        href: '/services/full-stack',
        descriptionKey: 'full_stack_development_description',
        icon: Layers,
      },
    ],
  },
]

export type CommandActionId = 'toggle-theme'

type CommandPaletteMessages = typeof messages.components.layout.command_palette
export type CommandPaletteMessageKey = keyof CommandPaletteMessages

export type CommandPaletteQuickAction = {
  id: CommandActionId
  titleKey: CommandPaletteMessageKey
  icon?: React.ElementType
  dynamicIcon?: {
    dark: React.ElementType
    light: React.ElementType
  }
}

export type CommandPaletteGroup = {
  heading: string
  items: Array<{
    titleKey: NavMessageKey
    href?: string
    descriptionKey?: NavMessageKey
    icon?: React.ElementType
    actionId?: CommandActionId
    keywords?: string[]
  }>
}

export type CommandPaletteShortcut = {
  key: string
  labelKey: CommandPaletteMessageKey
  modifier?: boolean
}

export type CommandPaletteConfig = {
  titleKey: CommandPaletteMessageKey
  descriptionKey: CommandPaletteMessageKey
  placeholderKey: CommandPaletteMessageKey
  quickActions: CommandPaletteQuickAction[]
  extraGroups: CommandPaletteGroup[]
  shortcuts: CommandPaletteShortcut[]
}

export const commandPaletteConfig: CommandPaletteConfig = {
  titleKey: 'title',
  descriptionKey: 'description',
  placeholderKey: 'placeholder',
  quickActions: [
    {
      id: 'toggle-theme',
      titleKey: 'toggle_theme',
      dynamicIcon: {
        dark: Sun,
        light: Moon,
      },
    },
  ],
  extraGroups: [],
  shortcuts: [
    { key: '↵', labelKey: 'go_to_page' },
    { key: 'K', labelKey: 'menu', modifier: true },
    { key: 'T', labelKey: 'toggle_theme_shortcut' },
    { key: 'Esc', labelKey: 'close' },
  ],
}
