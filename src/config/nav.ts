import {
  BookOpen,
  Code2,
  FileText,
  GraduationCap,
  Home,
  Layers,
  Mail,
  Moon,
  ShieldCheck,
  Sparkles,
  Sun,
  User,
} from 'lucide-react'

export type NavSectionColor = 'emerald' | 'purple' | 'blue' | 'cyan' | 'default'

export type SubItem = {
  title: string
  href: string
  description: string
  icon?: React.ElementType
}

export type NavItem = {
  title: string
  color?: NavSectionColor
  href?: string
  icon?: React.ElementType
  items?: SubItem[]
}

export const navConfig: NavItem[] = [
  {
    title: 'Home',
    href: '/',
    icon: Home,
  },
  {
    title: 'About',
    color: 'blue',
    items: [
      {
        title: 'About',
        href: '/about',
        description: 'Learn more about my journey and expertise',
        icon: User,
      },
      {
        title: 'Resume',
        href: '/resume',
        description: 'View my professional experience and skills',
        icon: FileText,
      },
      {
        title: 'Contact',
        href: '/contact',
        description: 'Get in touch with me for collaborations',
        icon: Mail,
      },
    ],
  },
  {
    title: 'Content',
    color: 'cyan',
    items: [
      {
        title: 'Blog',
        href: '/blog',
        description: 'Read articles on programming and tech',
        icon: BookOpen,
      },
      {
        title: 'Courses',
        href: '/courses',
        description: 'Explore my educational courses',
        icon: GraduationCap,
      },
    ],
  },
  {
    title: 'Resources',
    color: 'emerald',
    items: [
      {
        title: 'Snippets',
        href: '/resources/snippets',
        description: 'Useful code snippets and starter templates',
        icon: Code2,
      },
      {
        title: 'Tools',
        href: '/resources/tools',
        description: 'Curated developer tools and software',
        icon: Layers,
      },
    ],
  },
  {
    title: 'Services',
    color: 'purple',
    items: [
      {
        title: 'Web Development',
        href: '/services/web-development',
        description: 'Modern, responsive UI components & web applications',
        icon: Sparkles,
      },
      {
        title: 'Security & Auditing',
        href: '/services/security',
        description: 'Application security reviews and consulting',
        icon: ShieldCheck,
      },
    ],
  },
]

export type CommandActionId = 'toggle-theme'

export type CommandPaletteQuickAction = {
  id: CommandActionId
  title: string
  icon?: React.ElementType
  dynamicIcon?: {
    dark: React.ElementType
    light: React.ElementType
  }
}

export type CommandPaletteGroup = {
  heading: string
  items: Array<{
    title: string
    href?: string
    description?: string
    icon?: React.ElementType
    actionId?: CommandActionId
    keywords?: string[]
  }>
}

export type CommandPaletteShortcut = {
  key: string
  label: string
  modifier?: boolean
}

export type CommandPaletteConfig = {
  title: string
  description: string
  placeholder: string
  quickActions: CommandPaletteQuickAction[]
  extraGroups: CommandPaletteGroup[]
  shortcuts: CommandPaletteShortcut[]
}

export const commandPaletteConfig: CommandPaletteConfig = {
  title: 'Search documentation and navigation',
  description: 'Type a command or search for pages',
  placeholder: 'Search documentation and pages...',
  quickActions: [
    {
      id: 'toggle-theme',
      title: 'Toggle theme',
      dynamicIcon: {
        dark: Sun,
        light: Moon,
      },
    },
  ],
  extraGroups: [],
  shortcuts: [
    { key: '↵', label: 'Go to Page' },
    { key: 'K', label: 'Menu', modifier: true },
    { key: 'T', label: 'Toggle Theme' },
    { key: 'Esc', label: 'Close' },
  ],
}
