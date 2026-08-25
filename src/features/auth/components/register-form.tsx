'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { sileo } from 'sileo'
import { ActionButton } from '@/components/ui/action-button'
import { LinkButton } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup } from '@/components/ui/field'
import { Marker, MarkerContent } from '@/components/ui/marker'
import { PasswordInputStrengthChecker } from '@/features/auth/components/password-input'
import { registerUserService } from '@/features/auth/services/auth.service'
import { type SignUpForm, signUpSchema } from '../schemas/auth.schema'
import { ControlledCheckbox } from './controlled-checkbox'
import { ControlledInput } from './controlled-input'
import { SocialAuthButtons } from './social-auth-buttons'

export function RegisterForm() {
  const router = useRouter()
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
  })

  async function handleSignUp(data: SignUpForm) {
    const { confirmPassword, acceptTerms, ...signUpData } = data

    const [err, user] = await registerUserService(signUpData)

    if (err === null) {
      sileo.success({
        title: 'Account created!',
        description: `Welcome to the platform${user.name ? `, ${user.name}` : ''}.`,
      })
      router.push('/')
      router.refresh()
      return
    }

    switch (err.reason) {
      case 'USER_ALREADY_EXISTS':
        sileo.error({
          title: 'Email in use',
          description: 'This email is already registered. Please log in.',
        })
        break
      case 'WEAK_PASSWORD':
        sileo.error({
          title: 'Invalid Password',
          description: 'Please ensure your password meets all requirements.',
        })
        break
      case 'AUTO_LOGIN_FAILED':
        sileo.warning({
          title: 'Partial Success',
          description: 'Account created successfully, but please log in manually.',
        })
        router.push('/login')
        break
      case 'UNKNOWN_ERROR':
        sileo.error({
          title: 'Registration Failed',
          description: err.details,
        })
        break
      default:
        err satisfies never
        sileo.error({
          title: 'Unexpected Error',
          description: 'An unexpected error occurred. Please try again.',
        })
    }
  }

  return (
    <Card className="w-full max-w-xl m-6">
      <CardHeader className="text-2xl font-bold">
        <CardTitle>Sign In</CardTitle>
      </CardHeader>
      <CardContent>
        <form id="sign-up" onSubmit={handleSubmit(handleSignUp)}>
          <FieldGroup>
            <ControlledInput
              control={control}
              name="name"
              label="Name"
              placeholder="Name"
              autoComplete="name"
            />
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
              autoComplete="new-password"
              isPassword
            />
            <ControlledInput
              control={control}
              name="confirmPassword"
              label="Confirm Password"
              placeholder="****************"
              autoComplete="new-password"
              isPassword
            >
              <PasswordInputStrengthChecker />
            </ControlledInput>
            <ControlledCheckbox control={control} name="acceptTerms">
              <span className="text-sm text-muted-foreground">
                I agree to the{' '}
                <Link
                  href="/legal/terms"
                  className="text-primary underline-offset-4 hover:underline"
                  target="_blank"
                >
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link
                  href="/legal/privacy-policy"
                  className="text-primary underline-offset-4 hover:underline"
                  target="_blank"
                >
                  Privacy Policy
                </Link>
                .
              </span>
            </ControlledCheckbox>

            <ActionButton
              type="submit"
              className="mt-4"
              loadingText="Signing up"
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              Sign Up
            </ActionButton>
          </FieldGroup>
        </form>
        <LinkButton className="mt-12 w-full" href="/login" variant="outline">
          I already have an account
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
