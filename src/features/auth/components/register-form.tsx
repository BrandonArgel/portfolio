'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { ActionButton } from '@/components/ui/action-button'
import { LinkButton } from '@/components/ui/button'
import { FieldGroup } from '@/components/ui/field'
import { useAuthSuccess } from '@/features/auth/hooks/use-auth-success'
import { useRegisterErrors } from '@/features/auth/hooks/use-register-errors'
import { registerService } from '@/features/auth/services/register-service'
import { Link } from '@/i18n/navigation'
import { type SignUpForm, signUpSchema } from '../schemas/auth-schema'
import { AuthCardLayout } from './auth-card-layout'
import { ControlledCheckbox } from './controlled-checkbox'
import { ControlledInput } from './controlled-input'

export function RegisterForm() {
  const t = useTranslations('features.auth.register')
  const tGlobal = useTranslations('common')
  const { handleRegisterError } = useRegisterErrors()
  const { handleAuthSuccess } = useAuthSuccess()

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

    const [err, user] = await registerService(signUpData)

    if (err) {
      handleRegisterError(err)
      return
    }

    handleAuthSuccess({
      event: 'Signup',
      title: t('account_created_title'),
      description: t('account_created_description', { name: user.name || 'empty' }),
      user,
    })
  }

  return (
    <AuthCardLayout title={t('title')}>
      <form id="sign-up" onSubmit={handleSubmit(handleSignUp)}>
        <FieldGroup>
          <ControlledInput
            control={control}
            name="name"
            label={tGlobal('labels.name')}
            placeholder={tGlobal('placeholders.name')}
            autoComplete="name"
          />
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
            autoComplete="new-password"
            isPassword
          />
          <ControlledInput
            control={control}
            name="confirmPassword"
            label={tGlobal('labels.confirm_password')}
            placeholder={tGlobal('placeholders.password')}
            autoComplete="new-password"
            isPassword
          />
          <ControlledCheckbox control={control} name="acceptTerms">
            <span className="text-sm text-muted-foreground">
              {t('accept_terms')}{' '}
              <Link
                href="/legal/terms-of-service"
                className="text-primary underline-offset-4 hover:underline"
                target="_blank"
              >
                {t('terms_of_service')}
              </Link>{' '}
              {t('and')}{' '}
              <Link
                href="/legal/privacy-policy"
                className="text-primary underline-offset-4 hover:underline"
                target="_blank"
              >
                {t('privacy_policy')}
              </Link>
              .
            </span>
          </ControlledCheckbox>

          <ActionButton
            type="submit"
            className="mt-4"
            loadingText={tGlobal('states.signing_up')}
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            {tGlobal('actions.sign_up')}
          </ActionButton>
          <LinkButton
            className="w-full"
            href="https://securitytool.brandonargel.com"
            variant="ghost"
          >
            {t('create_password')}
          </LinkButton>
        </FieldGroup>
      </form>
      <LinkButton className="mt-12 w-full" href="/login" variant="outline">
        {t('already_have_account')}
      </LinkButton>
    </AuthCardLayout>
  )
}
