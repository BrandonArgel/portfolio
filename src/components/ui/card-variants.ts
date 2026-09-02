import { cva } from 'class-variance-authority'

export type CardColor = 'blue' | 'purple' | 'emerald' | 'amber' | 'rose' | 'cyan' | 'default'

export const themeVariants = {
  wrapper: cva(
    'bg-card/60 backdrop-blur-sm transition-all duration-300 hover:bg-card/90 hover:-translate-y-0.5',
    {
      variants: {
        color: {
          default: 'hover:ring-primary/40 hover:shadow-xl',
          blue: 'hover:ring-blue-500/40 hover:shadow-xl hover:shadow-blue-500/10 dark:hover:shadow-blue-500/5',
          purple:
            'hover:ring-purple-500/40 hover:shadow-xl hover:shadow-purple-500/10 dark:hover:shadow-purple-500/5',
          emerald:
            'hover:ring-emerald-500/40 hover:shadow-xl hover:shadow-emerald-500/10 dark:hover:shadow-emerald-500/5',
          amber:
            'hover:ring-amber-500/40 hover:shadow-xl hover:shadow-amber-500/10 dark:hover:shadow-amber-500/5',
          rose: 'hover:ring-rose-500/40 hover:shadow-xl hover:shadow-rose-500/10 dark:hover:shadow-rose-500/5',
          cyan: 'hover:ring-cyan-500/40 hover:shadow-xl hover:shadow-cyan-500/10 dark:hover:shadow-cyan-500/5',
        },
      },
      defaultVariants: { color: 'default' },
    },
  ),
  iconBox: cva(
    'flex items-center justify-center rounded-xl border transition-transform duration-300 group-hover/card:scale-105',
    {
      variants: {
        color: {
          default: 'bg-primary/10 border-primary/20 text-primary',
          blue: 'bg-blue-100 border-blue-200 text-blue-600 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400',
          purple:
            'bg-purple-100 border-purple-200 text-purple-600 dark:bg-purple-500/10 dark:border-purple-500/20 dark:text-purple-400',
          emerald:
            'bg-emerald-100 border-emerald-200 text-emerald-600 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400',
          amber:
            'bg-amber-100 border-amber-200 text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400',
          rose: 'bg-rose-100 border-rose-200 text-rose-600 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400',
          cyan: 'bg-cyan-100 border-cyan-200 text-cyan-700 dark:bg-cyan-500/10 dark:border-cyan-500/20 dark:text-cyan-400',
        },
      },
      defaultVariants: { color: 'default' },
    },
  ),
  title: cva('transition-colors', {
    variants: {
      color: {
        default: 'group-hover/card:text-primary',
        blue: 'group-hover/card:text-blue-600 dark:group-hover/card:text-blue-400',
        purple: 'group-hover/card:text-purple-600 dark:group-hover/card:text-purple-400',
        emerald: 'group-hover/card:text-emerald-600 dark:group-hover/card:text-emerald-400',
        amber: 'group-hover/card:text-amber-700 dark:group-hover/card:text-amber-400',
        rose: 'group-hover/card:text-rose-600 dark:group-hover/card:text-rose-400',
        cyan: 'group-hover/card:text-cyan-700 dark:group-hover/card:text-cyan-400',
      },
    },
    defaultVariants: { color: 'default' },
  }),
  checkIcon: cva('size-3.5 shrink-0 stroke-[2.5]', {
    variants: {
      color: {
        default: 'text-primary',
        blue: 'text-blue-600 dark:text-blue-400',
        purple: 'text-purple-600 dark:text-purple-400',
        emerald: 'text-emerald-600 dark:text-emerald-400',
        amber: 'text-amber-700 dark:text-amber-400',
        rose: 'text-rose-600 dark:text-rose-400',
        cyan: 'text-cyan-700 dark:text-cyan-400',
      },
    },
    defaultVariants: { color: 'default' },
  }),
  link: cva('group/link inline-flex items-center gap-1 text-sm font-medium transition-colors', {
    variants: {
      color: {
        default: 'text-primary hover:text-primary/80',
        blue: 'text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300',
        purple:
          'text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300',
        emerald:
          'text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300',
        amber: 'text-amber-700 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300',
        rose: 'text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300',
        cyan: 'text-cyan-700 hover:text-cyan-800 dark:text-cyan-400 dark:hover:text-cyan-300',
      },
    },
    defaultVariants: { color: 'default' },
  }),
}
