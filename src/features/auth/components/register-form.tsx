'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { sileo } from 'sileo'
import { ActionButton } from '@/components/ui/action-button'
import { LinkButton } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup } from '@/components/ui/field'
import { Marker, MarkerContent } from '@/components/ui/marker'
import { PasswordInputStrengthChecker } from '@/features/auth/components/password-input'
import { registerUserService } from '@/features/auth/services/auth.service'
import { Link, useRouter } from '@/i18n/navigation'
import { type SignUpForm, signUpSchema } from '../schemas/auth.schema'
import { ControlledCheckbox } from './controlled-checkbox'
import { ControlledInput } from './controlled-input'
import { SocialAuthButtons } from './social-auth-buttons'

export function RegisterForm() {
  const router = useRouter()
  const t = useTranslations('auth.register')
  const tGlobal = useTranslations('common')
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
        title: t('account_created_title'),
        description: t('account_created_description', { name: user.name || 'empty' }),
      })
      router.push('/')
      router.refresh()
      return
    }

    switch (err.reason) {
      case 'USER_ALREADY_EXISTS':
        sileo.error({
          title: t('email_in_use_title'),
          description: t('email_in_use_description'),
        })
        break
      case 'WEAK_PASSWORD':
        sileo.error({
          title: t('invalid_password_title'),
          description: t('invalid_password_description'),
        })
        break
      case 'AUTO_LOGIN_FAILED':
        sileo.warning({
          title: t('partial_success_title'),
          description: t('partial_success_description'),
        })
        router.push('/login')
        break
      case 'UNKNOWN_ERROR':
        sileo.error({
          title: t('registration_failed_title'),
          description: err.details,
        })
        break
      default:
        err satisfies never
        sileo.error({
          title: tGlobal('errors.unexpected_title'),
          description: tGlobal('errors.unexpected_description'),
        })
    }
  }

  return (
    <Card className="w-full max-w-xl m-6">
      <CardHeader className="text-2xl font-bold">
        <CardTitle>{t('title')}</CardTitle>
      </CardHeader>
      <CardContent>
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
            >
              <PasswordInputStrengthChecker />
            </ControlledInput>
            <ControlledCheckbox control={control} name="acceptTerms">
              <span className="text-sm text-muted-foreground">
                {t('accept_terms')}{' '}
                <Link
                  href="/legal/terms"
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
          </FieldGroup>
        </form>
        <LinkButton className="mt-12 w-full" href="/login" variant="outline">
          {t('already_have_account')}
        </LinkButton>
      </CardContent>

      <Marker variant="separator">
        <MarkerContent>{tGlobal('labels.or')}</MarkerContent>
      </Marker>

      <CardFooter className="grid grid-cols-1 gap-3 border-t-0 bg-inherit sm:grid-cols-2">
        <SocialAuthButtons />
      </CardFooter>
    </Card>
  )
}
