import { desc, eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { db } from '@/db' // Tu instancia de Turso
import { posts } from '@/db/schema'
import { auth } from '@/lib/auth/auth' // Tu instancia de Better Auth
import { DeletePostButton } from './_components/delete-button' // El Client Component que creamos antes

export default async function DashboardPostsPage() {
  // 1. Obtener la sesión en el servidor de forma síncrona
  // Nota: Como ya protegiste la ruta en el middleware.ts, técnicamente
  // sabemos que hay sesión, pero volver a pedirla aquí es barato y
  // nos da el objeto `user` tipado para usar su ID en la consulta SQL.
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect('/login')
  }

  // 2. Consulta a Turso usando Drizzle
  // Aquí filtramos para que solo traiga los posts que le pertenecen al usuario actual.
  // También los ordenamos por fecha de creación descendente.
  const userPosts = await db.query.posts.findMany({
    where: eq(posts.authorId, session.user.id),
    orderBy: [desc(posts.createdAt)],
    // Con Drizzle puedes traer solo los campos que necesitas para la tabla,
    // esto hace que la respuesta de Turso sea aún más rápida.
    columns: {
      id: true,
      title: true,
      published: true,
      createdAt: true,
    },
  })

  // 3. Renderizado en el servidor
  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Mis Artículos</h1>
        <p className="text-sm text-muted-foreground">
          Sesión iniciada como: {session.user.name} ({session.user.role})
        </p>
      </header>

      {userPosts.length === 0 ? (
        <p className="text-muted-foreground">No tienes artículos todavía.</p>
      ) : (
        <div className="grid gap-4">
          {userPosts.map((post) => (
            <div key={post.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h2 className="font-semibold">{post.title}</h2>
                <span
                  className={`text-xs ${post.published ? 'text-green-500' : 'text-yellow-500'}`}
                >
                  {post.published ? 'Publicado' : 'Borrador'}
                </span>
              </div>

              {/* Inyectamos el Client Component para la interactividad de borrado */}
              <DeletePostButton postId={post.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
