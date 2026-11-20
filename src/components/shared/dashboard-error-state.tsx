import { AlertTriangle } from 'lucide-react'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'

interface DashboardErrorStateProps {
  title: string
  description?: string
}

export function DashboardErrorState({ title, description }: DashboardErrorStateProps) {
  return (
    <div className="p-4">
      <Empty className="py-16 border border-dashed border-destructive/30 rounded-xl">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <AlertTriangle className="text-destructive" />
          </EmptyMedia>
          <EmptyTitle>{title}</EmptyTitle>
          {description && <EmptyDescription>{description}</EmptyDescription>}
        </EmptyHeader>
      </Empty>
    </div>
  )
}
