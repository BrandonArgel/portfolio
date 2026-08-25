'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { sileo } from 'sileo'
import { ActionButton } from '@/components/ui/action-button'
import { LinkButton } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup } from '@/components/ui/field'
import { Marker, MarkerContent } from '@/components/ui/marker'
import { loginUserService } from '@/features/auth/services/auth.service'
import { type SignInForm, signInSchema } from '../schemas/auth.schema'
import { ControlledCheckbox } from './controlled-checkbox'
import { ControlledInput } from './controlled-input'
import { SocialAuthButtons } from './social-auth-buttons'

export function LoginForm() {
  const router = useRouter()

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '', rememberMe: false },
  })

  async function handleSignIn(data: SignInForm) {
    const [err, user] = await loginUserService(data)

    if (err === null) {
      sileo.success({
        title: `Welcome back${user.name ? `, ${user.name}` : ''}!`,
      })
      router.push('/')
      router.refresh()
      return
    }

    switch (err.reason) {
      case 'INVALID_CREDENTIALS':
        sileo.error({
          title: 'Sign In Failed',
          description: 'Invalid email or password. Please check your credentials.',
        })
        break

      case 'UNKNOWN_ERROR':
        sileo.error({
          title: 'System Error',
          description: err.details,
        })
        break

      default:
        err satisfies never
        sileo.error({
          title: 'Unexpected Error',
          description: 'An unexpected error occurred. Please try again later.',
        })
    }
  }

  return (
    <Card className="w-full max-w-xl m-6">
      <CardHeader className="text-2xl font-bold">
        <CardTitle>Sign In</CardTitle>
      </CardHeader>
      <CardContent>
        <form id="sign-in" onSubmit={handleSubmit(handleSignIn)}>
          <FieldGroup>
            <ControlledInput
              control={control}
              name="email"
              label="Email"
              type="email"
              placeholder="user@domain.com"
              autoComplete="email"
            />
            <ControlledInput
              control={control}
              name="password"
              label="Password"
              placeholder="****************"
              autoComplete="current-password webauthn"
              isPassword
            />
            <ControlledCheckbox control={control} name="rememberMe">
              Remember me
            </ControlledCheckbox>

            <ActionButton
              type="submit"
              className="mt-4"
              loadingText="Signing in"
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              Sign In
            </ActionButton>
          </FieldGroup>
        </form>
        <LinkButton
          className="mt-4 w-full"
          href="/login/identify"
          variant="ghost"
          aria-disabled={isSubmitting}
        >
          Forgot password?
        </LinkButton>
        <LinkButton className="mt-12 w-full" href="/register" variant="outline">
          Create new account
        </LinkButton>
      </CardContent>

      <Marker variant="separator">
        <MarkerContent>Or</MarkerContent>
      </Marker>

      <CardFooter className="grid grid-cols-1 gap-3 border-t-0 bg-inherit sm:grid-cols-2">
        <SocialAuthButtons />
      </CardFooter>
    </Card>
  )
}
