'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { ActionButton } from '@/components/ui/action-button'
import { LinkButton } from '@/components/ui/button'
import { FieldGroup } from '@/components/ui/field'
import { useAuthSuccess } from '@/features/auth/hooks/use-auth-success'
import { loginService } from '@/features/auth/services/login-service'
import { useLoginErrors } from '../hooks/use-login-errors'
import { type SignInForm, signInSchema } from '../schemas/auth-schema'
import { AuthCardLayout } from './auth-card-layout'
import { ControlledCheckbox } from './controlled-checkbox'
import { ControlledInput } from './controlled-input'

export function LoginForm() {
  const t = useTranslations('features.auth.login')
  const tGlobal = useTranslations('common')
  const { handleLoginError } = useLoginErrors()
  const { handleAuthSuccess } = useAuthSuccess()

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '', rememberMe: false },
  })

  async function handleSignIn(data: SignInForm) {
    const [error, user] = await loginService(data)

    if (error) {
      handleLoginError(error)
      return
    }

    handleAuthSuccess({
      event: 'Login',
      title: t('welcome_back', { name: user.name || 'empty' }),
      user,
    })
  }

  return (
    <AuthCardLayout title={t('title')}>
      <form id="sign-in" onSubmit={handleSubmit(handleSignIn)}>
        <FieldGroup>
          <ControlledInput
            control={control}
            name="email"
            label={tGlobal('labels.email')}
            type="email"
            placeholder={tGlobal('placeholders.email')}
            autoComplete="email"
          />
          <ControlledInput
            control={control}
            name="password"
            label={tGlobal('labels.password')}
            placeholder={tGlobal('placeholders.password')}
            autoComplete="current-password webauthn"
            isPassword
          />
          <ControlledCheckbox control={control} name="rememberMe">
            {tGlobal('labels.remember_me')}
          </ControlledCheckbox>

          <ActionButton
            type="submit"
            className="mt-4"
            loadingText={tGlobal('states.signing_in')}
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            {tGlobal('actions.sign_in')}
          </ActionButton>
        </FieldGroup>
      </form>
      <LinkButton
        className="mt-4 w-full"
        href="/login/identify"
        variant="ghost"
        aria-disabled={isSubmitting}
      >
        {t('forgot_password')}
      </LinkButton>
      <LinkButton className="mt-12 w-full" href="/register" variant="outline">
        {t('create_account')}
      </LinkButton>
    </AuthCardLayout>
  )
}
