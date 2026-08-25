'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db } from '@/db' // Tu instancia de Turso
import { posts } from '@/db/schema'
import { adminActionClient } from '@/lib/safe-action'

// Definimos el esquema de entrada (ej. necesitamos el ID del post a borrar)
const deletePostSchema = z.object({
  postId: z.string().min(1, 'El ID del artículo es requerido'),
})

// Usamos el adminActionClient para proteger esta mutación
export const deletePostAction = adminActionClient
  .schema(deletePostSchema)
  .action(async ({ parsedInput: { postId }, ctx }) => {
    // En este punto, estamos 100% seguros de que ctx.user.role === 'admin'

    try {
      await db.delete(posts).where(eq(posts.id, postId))

      // Refrescamos el dashboard para que desaparezca el artículo de la lista
      revalidatePath('/dashboard/posts')

      return { success: 'Artículo eliminado correctamente.' }
    } catch (error) {
      throw new Error('Hubo un error al intentar eliminar el artículo en Turso.')
    }
  })
