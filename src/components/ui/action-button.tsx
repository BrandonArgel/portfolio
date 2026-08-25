'use client'

import { type ComponentProps, useState } from 'react'
import { sileo } from 'sileo'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

export function ActionButton({
  action,
  isLoading: externalIsLoading,
  loadingText,
  requireAreYouSure = false,
  areYouSureDescription = 'This action cannot be undone.',
  children,
  ...props
}: ComponentProps<typeof Button> & {
  action?: () => Promise<{ error: boolean; message?: string } | void | any>
  isLoading?: boolean
  loadingText?: string
  requireAreYouSure?: boolean
  areYouSureDescription?: React.ReactNode
}) {
  const [internalIsLoading, setInternalIsLoading] = useState(false)

  const isLoading = externalIsLoading !== undefined ? externalIsLoading : internalIsLoading

  async function performAction() {
    if (!action) return

    setInternalIsLoading(true)
    try {
      const data = await action()
      if (data?.error) sileo.error({ title: data.message ?? 'Error' })
    } catch (error) {
      sileo.error({ title: 'An unexpected error occurred.' })
    } finally {
      setInternalIsLoading(false)
    }
  }

  const buttonContent = isLoading ? (
    <>
      {loadingText || children}
      <Spinner className="ml-2" />
    </>
  ) : (
    children
  )

  if (requireAreYouSure) {
    return (
      <AlertDialog open={isLoading ? true : undefined}>
        <AlertDialogTrigger>
          <Button {...props}>{children}</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>{areYouSureDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={isLoading} onClick={performAction}>
              {isLoading ? (
                <>
                  <Spinner className="mr-2" /> Processing...
                </>
              ) : (
                'Yes'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }

  return (
    <Button
      {...props}
      disabled={props.disabled ?? isLoading}
      onClick={(e) => {
        if (action) {
          e.preventDefault()
          performAction()
        }
        props.onClick?.(e)
      }}
    >
      {buttonContent}
    </Button>
  )
}
