import { randomUUID } from 'node:crypto'
import { eq } from 'drizzle-orm'
import { db } from './index'
// Importamos desde el nuevo esquema modular
import { categories, posts, postsToCategories, users } from './schema'

async function runSeed() {
  console.log('⏳ Initializing seed...')

  try {
    const adminEmail = 'brandargel@gmail.com'
    let adminId: string

    // 1. Admin user upsert
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, adminEmail),
    })

    if (existingUser) {
      console.log('✅ Admin user found. Ensuring role is updated...')
      adminId = existingUser.id
      await db.update(users).set({ role: 'admin' }).where(eq(users.id, adminId))
    } else {
      console.log('✅ Creating new admin user...')
      adminId = randomUUID()
      await db.insert(users).values({
        id: adminId,
        name: 'Brandon Argel Verdeja Domínguez',
        email: adminEmail,
        emailVerified: true,
        role: 'admin',
      })
    }

    // 2. Categories seed (idempotent)
    console.log('⏳ Seeding categories...')
    const categoriesData = [
      { name: 'Web Development', slug: 'web-development' },
      { name: 'Databases', slug: 'databases' },
      { name: 'Architecture', slug: 'architecture' },
    ]

    for (const cat of categoriesData) {
      const exists = await db.query.categories.findFirst({
        where: eq(categories.slug, cat.slug),
      })

      if (!exists) {
        await db.insert(categories).values({
          id: randomUUID(),
          name: cat.name,
          slug: cat.slug,
        })
      }
    }

    const allCategories = await db.query.categories.findMany()
    const devCategory = allCategories.find((c) => c.slug === 'web-development')
    const dbCategory = allCategories.find((c) => c.slug === 'databases')

    // 3. Test posts seed
    console.log('⏳ Seeding test posts...')
    const postsData = [
      {
        title: 'Serverless Architecture with Next.js and Turso',
        description:
          'A deep dive into building fast, scalable applications using Next.js on Vercel and LibSQL on Turso.',
        slug: 'serverless-architecture-nextjs-turso',
        content:
          'This is the test content for my first post detailing serverless architecture. By leveraging modern tools like Next.js, Vercel, Turso, and Drizzle ORM, we can build a robust and highly available system with zero cold start issues for database connections.',
        published: false,
        locale: 'en',
        authorId: adminId,
        categoryId: devCategory?.id,
      },
      {
        title: 'Migrando a Drizzle ORM: Mi Experiencia',
        description:
          'Por qué decidí pasar a Drizzle ORM para mi portafolio personal y cómo estructurar los esquemas.',
        slug: 'migrando-a-drizzle-orm',
        content:
          'Drizzle ORM ofrece un control mucho más granular y predecible sobre el SQL que se ejecuta por debajo. Al integrarlo con Turso (SQLite), el rendimiento es inmediato. En este post exploro cómo modularizar esquemas de manera limpia para un proyecto en crecimiento.',
        published: false,
        locale: 'es',
        authorId: adminId,
        categoryId: dbCategory?.id,
      },
    ]

    for (const post of postsData) {
      const { categoryId, ...postFields } = post
      const existingPost = await db.query.posts.findFirst({
        where: eq(posts.slug, postFields.slug),
      })

      if (existingPost) {
        console.log(`- Post "${postFields.slug}" already exists. Skipping.`)
      } else {
        const newPostId = randomUUID()
        await db.insert(posts).values({
          id: newPostId,
          ...postFields,
        })

        if (categoryId) {
          await db.insert(postsToCategories).values({
            postId: newPostId,
            categoryId: categoryId,
          })
        }
        console.log(`- Created post: "${postFields.slug}"`)
      }
    }

    console.log('✅ Seed process finished successfully.')
  } catch (error) {
    console.error('❌ Error executing the seed:', error)
    process.exit(1)
  } finally {
    process.exit(0)
  }
}

runSeed()
