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
import { loginUserService } from '@/features/auth/services/auth.service'
import { useRouter } from '@/i18n/navigation'
import { type SignInForm, signInSchema } from '../schemas/auth.schema'
import { ControlledCheckbox } from './controlled-checkbox'
import { ControlledInput } from './controlled-input'
import { SocialAuthButtons } from './social-auth-buttons'

export function LoginForm() {
  const router = useRouter()
  const t = useTranslations('auth.login')
  const tGlobal = useTranslations('common')

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
        title: t('welcome_back', { name: user.name || 'empty' }),
      })
      router.push('/')
      router.refresh()
      return
    }

    switch (err.reason) {
      case 'INVALID_CREDENTIALS':
        sileo.error({
          title: t('invalid_credentials_title'),
          description: t('invalid_credentials_description'),
        })
        break

      case 'UNKNOWN_ERROR':
        sileo.error({
          title: tGlobal('errors.system_title'),
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
