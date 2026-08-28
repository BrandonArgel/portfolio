'use client'

import { Button } from '@/components/ui/button'

export function DeletePostButton({ postId }: { postId: string }) {
  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={() => {
        console.log('Delete post', postId)
      }}
    >
      Eliminar
    </Button>
  )
}
