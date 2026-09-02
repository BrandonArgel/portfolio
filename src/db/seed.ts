import { randomUUID } from 'node:crypto'
import { eq } from 'drizzle-orm'
import { db } from './index'
import { posts, user } from './schema'

async function runSeed() {
  console.log('⏳ Initializing seed...')

  try {
    const adminEmail = 'brandargel@gmail.com'
    let adminId: string

    const existingUser = await db.query.user.findFirst({
      where: eq(user.email, adminEmail),
    })

    if (existingUser) {
      console.log('✅ User found in Turso. Updating role to admin...')
      adminId = existingUser.id

      await db.update(user).set({ role: 'admin' }).where(eq(user.id, adminId))
    } else {
      console.log('✅ Creating new admin user...')
      adminId = randomUUID()
      await db.insert(user).values({
        id: adminId,
        name: 'Brandon Argel Verdeja Dominguez',
        email: adminEmail,
        emailVerified: true,
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }

    console.log('⏳ Inserting test posts...')
    await db.insert(posts).values([
      {
        title: 'Serverless Architecture with Next.js and Turso',
        slug: 'serverless-architecture-nextjs-turso',
        content: 'This is the test content for my first post detailing...',
        published: true,
        authorId: adminId,
      },
      {
        title: 'Draft: Integrating Better Auth',
        slug: 'draft-integrating-better-auth',
        content: 'Content pending...',
        published: false,
        authorId: adminId,
      },
    ])
    console.log('✅ Test posts created.')
  } catch (error) {
    console.error('❌ Error executing the seed:', error)
  } finally {
    console.log('🏁 Process completed.')
    process.exit(0)
  }
}

runSeed()
