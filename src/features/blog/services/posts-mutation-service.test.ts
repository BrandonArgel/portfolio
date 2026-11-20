import { afterEach, beforeEach, describe, expect, test } from 'bun:test'
import { eq } from 'drizzle-orm'
import { posts } from '@/db/schema'
import { createTestDb, seedTestUser, type TestDbContext } from '@/db/test-db'
import {
  deletePost,
  discardPostDraft,
  savePost,
  togglePostPublishStatus,
} from './posts-mutation-service'

describe('posts-mutation-service', () => {
  let ctx: TestDbContext

  beforeEach(async () => {
    ctx = await createTestDb()
  })

  afterEach(() => {
    ctx.close()
  })

  test('savePost creates drafts, publishes with draft overlay, and tracks slug changes', async () => {
    const editor = await seedTestUser(ctx.db, { id: 'ed-1', role: 'editor', name: 'Editor' })
    const otherEditor = await seedTestUser(ctx.db, { id: 'ed-2', role: 'editor', name: 'Other' })
    const admin = await seedTestUser(ctx.db, { id: 'ad-1', role: 'admin', name: 'Admin' })

    const actor = { id: editor.id, name: editor.name, role: editor.role }

    // Create published post with categories
    const [createErr, created] = await savePost(
      {
        title: 'First Article',
        slug: 'first-article',
        description: 'Summary',
        content: 'Live body content',
        locale: 'en',
        intent: 'publish',
        published: true,
        draft: false,
        categories: ['TypeScript', 'Next.js'],
      },
      actor,
      ctx.db,
    )

    expect(createErr).toBeNull()
    expect(created).toMatchObject({
      slug: 'first-article',
      previousSlug: null,
      slugChanged: false,
      published: true,
      draft: false,
    })
    if (!created) throw new Error('Expected created post')

    // Duplicate (locale, slug) rejected in 'en', allowed in 'es'
    const [dupErr] = await savePost(
      {
        title: 'Another',
        slug: 'first-article',
        description: '',
        content: 'Body',
        locale: 'en',
        intent: 'save_draft',
        published: false,
        draft: true,
        categories: [],
      },
      actor,
      ctx.db,
    )
    expect(dupErr).toEqual({
      reason: 'DUPLICATE_POST_SLUG',
      slug: 'first-article',
      locale: 'en',
    })

    const [esErr] = await savePost(
      {
        title: 'Primer Artículo',
        slug: 'first-article',
        description: '',
        content: '',
        locale: 'es',
        intent: 'save_draft',
        published: false,
        draft: true,
        categories: [],
      },
      actor,
      ctx.db,
    )
    expect(esErr).toBeNull()

    // Non-owner editor forbidden from updating
    const [forbidErr] = await savePost(
      {
        id: created.postId,
        title: 'Hijacked',
        slug: 'first-article',
        description: '',
        content: 'New',
        locale: 'en',
        intent: 'save_draft',
        published: true,
        draft: true,
        categories: [],
      },
      { id: otherEditor.id, name: otherEditor.name, role: otherEditor.role },
      ctx.db,
    )
    expect(forbidErr).toEqual({ reason: 'FORBIDDEN' })

    // Saving draft changes on published post stores overlay in draftContent and preserves live content
    const [overlayErr, overlayRes] = await savePost(
      {
        id: created.postId,
        title: 'Updated Title',
        slug: 'updated-article',
        description: 'Summary',
        content: 'Unpublished draft body',
        locale: 'en',
        intent: 'auto_save',
        published: true,
        draft: true,
        categories: ['TypeScript'],
      },
      { id: admin.id, name: admin.name, role: admin.role },
      ctx.db,
    )
    expect(overlayErr).toBeNull()
    expect(overlayRes).toMatchObject({
      slug: 'updated-article',
      previousSlug: 'first-article',
      slugChanged: true,
      published: true,
      draft: true,
    })

    const dbRow = await ctx.db.query.posts.findFirst({ where: eq(posts.id, created.postId) })
    expect(dbRow?.content).toBe('Live body content')
    expect(dbRow?.draftContent).toBe('Unpublished draft body')

    // Discard draft restores live content
    const [discardErr, discarded] = await discardPostDraft(created.postId, actor, ctx.db)
    expect(discardErr).toBeNull()
    expect(discarded?.content).toBe('Live body content')
    expect(discarded?.draft).toBe(false)

    // Discarding again fails with NO_DRAFT_TO_DISCARD
    expect((await discardPostDraft(created.postId, actor, ctx.db))[0]).toEqual({
      reason: 'NO_DRAFT_TO_DISCARD',
      identifier: created.postId,
    })

    expect((await discardPostDraft('missing', actor, ctx.db))[0]).toEqual({
      reason: 'POST_NOT_FOUND',
      identifier: 'missing',
    })
  })

  test('togglePostPublishStatus and deletePost enforce content validation and permissions', async () => {
    const editor = await seedTestUser(ctx.db, { id: 'ed-1', role: 'editor', name: 'Editor' })
    const admin = await seedTestUser(ctx.db, { id: 'ad-1', role: 'admin', name: 'Admin' })
    const editorActor = { id: editor.id, name: editor.name, role: editor.role }
    const adminActor = { id: admin.id, name: admin.name, role: admin.role }

    const [, emptyDraft] = await savePost(
      {
        title: 'Draft Only',
        slug: 'draft-only',
        description: '',
        content: '   ',
        locale: 'en',
        intent: 'save_draft',
        published: false,
        draft: true,
        categories: [],
      },
      editorActor,
      ctx.db,
    )
    if (!emptyDraft) throw new Error('Expected empty draft')

    // Publishing empty content fails with CONTENT_REQUIRED
    expect(
      (
        await togglePostPublishStatus(
          { postId: emptyDraft.postId, published: true },
          editorActor,
          ctx.db,
        )
      )[0],
    ).toEqual({ reason: 'CONTENT_REQUIRED' })

    // Save real content and publish via toggle
    await savePost(
      {
        id: emptyDraft.postId,
        title: 'Ready Post',
        slug: 'draft-only',
        description: '',
        content: 'Real body now',
        locale: 'en',
        intent: 'save_draft',
        published: false,
        draft: true,
        categories: [],
      },
      editorActor,
      ctx.db,
    )

    const [pubErr, pubRes] = await togglePostPublishStatus(
      { postId: emptyDraft.postId, published: true },
      editorActor,
      ctx.db,
    )
    expect(pubErr).toBeNull()
    expect(pubRes).toMatchObject({ published: true, draft: false })

    // Only admin can delete posts
    expect((await deletePost(emptyDraft.postId, editorActor, ctx.db))[0]).toEqual({
      reason: 'FORBIDDEN',
    })
    expect((await deletePost('missing', adminActor, ctx.db))[0]).toEqual({
      reason: 'POST_NOT_FOUND',
      identifier: 'missing',
    })

    const [delErr, delRes] = await deletePost(emptyDraft.postId, adminActor, ctx.db)
    expect(delErr).toBeNull()
    expect(delRes?.postId).toBe(emptyDraft.postId)
  })
})
