import { Spinner } from '@/components/ui/spinner'

interface EditorLoaderProps {
  text: string
}

export const EditorLoader = ({ text }: EditorLoaderProps) => {
  return (
    <>
      <span className="text-sm">{text}</span>
      <Spinner className="size-6" />
    </>
  )
}
