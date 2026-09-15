import { getTranslations } from 'next-intl/server'
// import { ProfileSection } from './ProfileSection';
// import { SecuritySection } from './SecuritySection';

export async function AccountContainer() {
  const t = await getTranslations('features.account.page')

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto py-10">
      <header>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-gray-500">{t('subtitle')}</p>
      </header>

      {/* <ProfileSection /> */}
      {/* <SecuritySection /> */}
    </div>
  )
}
