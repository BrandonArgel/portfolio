import Image from 'next/image'

export function Logo() {
  return (
    <div className="flex items-center gap-3 font-semibold text-foreground">
      <div className="relative size-9 shrink-0 overflow-hidden rounded-full border border-border bg-muted">
        <Image
          src="/brandon-argel.webp"
          alt="Brandon Argel"
          width={36}
          height={36}
          priority
          className="h-full w-full object-cover"
        />
      </div>
      <span className="font-bold text-base tracking-tight">Brandon Argel</span>
    </div>
  )
}
