import { Badge } from '@/components/ui/badge'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20">
      <div className="absolute inset-0 -z-1 overflow-hidden">
        <div className="absolute top-0 left-0 h-125 w-125 -translate-x-1/2 -translate-y-1/4 rounded-full bg-blue-50/50 dark:bg-blue-950/20"></div>
        <div className="absolute bottom-0 right-0 h-125 w-125 translate-x-1/2 translate-y-1/4 rounded-full bg-purple-50/50 dark:bg-purple-950/20"></div>
      </div>
      <div className="section-container max-w-7xl">
        <div>
          <Badge variant="softPrimary" size="lg">
            <span className="relative flex size-3 mr-1">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-75" />
              <span className="relative inline-flex size-3 rounded-full bg-current"></span>
            </span>
            Hi, I am Brandon Argel
          </Badge>
          <h1 className="mb-6 font-bold tracking-tight leading-tight text-fluid-title">
            Empowering
            <br />
            <span>Minds & Inspiring Change</span>
          </h1>
        </div>
        <div></div>
      </div>
    </section>
  )
}
