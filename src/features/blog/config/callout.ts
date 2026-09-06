export const COLOR_STYLES: Record<string, { container: string; icon: string }> = {
  red: {
    container: 'border-callout-red bg-callout-red/10 text-callout-red-text',
    icon: 'text-callout-red',
  },
  purple: {
    container: 'border-callout-purple bg-callout-purple/10 text-callout-purple-text',
    icon: 'text-callout-purple',
  },
  blue: {
    container: 'border-callout-blue bg-callout-blue/10 text-callout-blue-text',
    icon: 'text-callout-blue',
  },
  cyan: {
    container: 'border-callout-cyan bg-callout-cyan/10 text-callout-cyan-text',
    icon: 'text-callout-cyan',
  },
  green: {
    container: 'border-callout-green bg-callout-green/10 text-callout-green-text',
    icon: 'text-callout-green',
  },
  yellow: {
    container: 'border-callout-yellow bg-callout-yellow/10 text-callout-yellow-text',
    icon: 'text-callout-yellow',
  },
  gray: {
    container: 'border-callout-gray bg-callout-gray/10 text-callout-gray-text',
    icon: 'text-callout-gray',
  },
}

export const CALLOUT_CONFIG: Record<
  string,
  { color: keyof typeof COLOR_STYLES; iconName: string }
> = {
  bug: { color: 'red', iconName: 'bug' },
  danger: { color: 'red', iconName: 'zap' },
  error: { color: 'red', iconName: 'zap' },
  fail: { color: 'red', iconName: 'x' },
  failure: { color: 'red', iconName: 'x' },
  missing: { color: 'red', iconName: 'x' },

  // Purple
  example: { color: 'purple', iconName: 'list' },

  // Blue
  info: { color: 'blue', iconName: 'info' },
  todo: { color: 'blue', iconName: 'check-circle-2' },
  note: { color: 'blue', iconName: 'pencil' },
  calendar: { color: 'blue', iconName: 'calendar' },
  graph: { color: 'blue', iconName: 'line-chart' },
  health: { color: 'blue', iconName: 'activity' },
  kanban: { color: 'blue', iconName: 'kanban-square' },
  rocket: { color: 'blue', iconName: 'rocket' },

  // Cyan
  abstract: { color: 'cyan', iconName: 'clipboard-list' },
  summary: { color: 'cyan', iconName: 'clipboard-list' },
  tldr: { color: 'cyan', iconName: 'clipboard-list' },
  hint: { color: 'cyan', iconName: 'flame' },
  important: { color: 'cyan', iconName: 'flame' },
  tip: { color: 'cyan', iconName: 'flame' },

  // Green
  check: { color: 'green', iconName: 'check' },
  done: { color: 'green', iconName: 'check' },
  success: { color: 'green', iconName: 'check' },

  // Yellow
  attention: { color: 'yellow', iconName: 'alert-triangle' },
  caution: { color: 'yellow', iconName: 'alert-triangle' },
  warning: { color: 'yellow', iconName: 'alert-triangle' },
  faq: { color: 'yellow', iconName: 'help-circle' },
  help: { color: 'yellow', iconName: 'help-circle' },
  question: { color: 'yellow', iconName: 'help-circle' },

  // Gray
  cite: { color: 'gray', iconName: 'quote' },
  quote: { color: 'gray', iconName: 'quote' },
}
