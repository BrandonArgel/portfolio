import { Badge } from '@/components/ui/badge'

interface HeroSkillsProps {
  skills: string[]
}

export function HeroSkills({ skills }: HeroSkillsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {skills.map((skill: string) => (
        <Badge key={skill} variant="softBlue" size="lg">
          {skill}
        </Badge>
      ))}
    </div>
  )
}
