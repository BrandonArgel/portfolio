import { AuthTracker } from '@/components/layout/auth-tracker'
import { Footer } from '@/components/layout/footer'
import { Header } from '@/components/layout/header/header'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AuthTracker />
      <Header />
      <main className="flex flex-1 flex-col overflow-hidden">{children}</main>
      <Footer />
    </>
  )
}
