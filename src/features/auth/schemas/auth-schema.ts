import z from 'zod'

export const signInSchema = z.object({
  email: z.email('Please enter a valid email.').min(1, 'Please enter your email.'),
  password: z
    .string('Please enter a valid password.')
    .min(8, 'Your password must be at least 8 characters long.')
    .max(128, 'Your password should have maximum 128 characters.'),
  rememberMe: z.boolean(),
})

export type SignInForm = z.infer<typeof signInSchema>

export const signUpSchema = z
  .object({
    name: z
      .string('Please enter a valid name.')
      .min(1, 'Please enter your name.')
      .max(128, 'Your name is too long.'),
    email: z.email('Please enter a valid email.').min(1, 'Please enter your email.'),
    password: z
      .string('Please enter a valid password.')
      .min(8, 'Your password must be at least 8 characters long.')
      .max(128, 'Your password should have maximum 128 characters.'),
    confirmPassword: z
      .string('Please enter a valid password.')
      .min(8, 'Your password must be at least 8 characters long.')
      .max(128, 'Your password should have maximum 128 characters.'),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: 'You must accept the terms and privacy policy.',
    }),
  })
  .refine(({ password, confirmPassword }) => password === confirmPassword, {
    message: "Passwords don't match.",
    path: ['confirmPassword'],
  })

export type SignUpForm = z.infer<typeof signUpSchema>
