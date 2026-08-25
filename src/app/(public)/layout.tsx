import { Header } from '@/components/layout/header/header'
// import { Footer } from "@/components/layout/footer";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      {/* <Footer /> */}
    </>
  )
}
