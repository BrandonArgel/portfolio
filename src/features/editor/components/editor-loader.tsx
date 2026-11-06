import { Spinner } from '@/components/ui/spinner'

interface EditorLoaderProps {
  text: string
}

export const EditorLoader = ({ text }: EditorLoaderProps) => {
  return (
    <div
      className="relative h-full w-full max-w-4xl flex-1 bg-secondary-background rounded-xl border border-border overflow-hidden dev
     shadow-sm flex items-center justify-center gap-3 text-muted-foreground"
    >
      <span className="text-sm">{text}</span>
      <Spinner className="size-6" />
    </div>
  )
}
