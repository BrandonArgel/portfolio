import { useTranslations } from 'next-intl'
import type { ReactNode } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Marker, MarkerContent } from '@/components/ui/marker'
import { SocialAuthButtons } from './social-auth-buttons'

interface AuthCardLayoutProps {
  title: string
  children: ReactNode
}

export function AuthCardLayout({ title, children }: AuthCardLayoutProps) {
  const tGlobal = useTranslations('common')

  return (
    <Card className="w-full max-w-xl m-6">
      <CardHeader className="text-2xl font-bold">
        <CardTitle className="text-center">{title}</CardTitle>
      </CardHeader>

      <CardContent>{children}</CardContent>

      <Marker variant="separator">
        <MarkerContent>{tGlobal('labels.or')}</MarkerContent>
      </Marker>

      <CardFooter className="grid grid-cols-1 gap-3 border-t-0 bg-inherit sm:grid-cols-2">
        <SocialAuthButtons />
      </CardFooter>
    </Card>
  )
}
