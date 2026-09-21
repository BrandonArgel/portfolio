import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { AccountContainer } from '@/features/account'
import { constructPageMetadata } from '@/lib/seo'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'metadata.account' })

  return constructPageMetadata({
    locale,
    title: t('title'),
    description: t('description'),
    pathname: '/account',
  })
}

export default function AccountPage() {
  return <AccountContainer />
}
