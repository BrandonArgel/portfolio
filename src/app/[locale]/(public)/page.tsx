import { RecentPostsSection } from '@/features/blog'
import { ContactSection } from '@/features/contact'
import { HeroSection } from '@/features/hero'
import { ServicesSection } from '@/features/services'
import { TestimonialsSection } from '@/features/testimonials'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ServicesSection />
      <TestimonialsSection />
      <RecentPostsSection />
      <ContactSection />
    </>
  )
}
