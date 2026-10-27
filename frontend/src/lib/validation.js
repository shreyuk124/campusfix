import { z } from 'zod';

export const loginSchema = z.object({
  role: z.enum(['student', 'staff', 'admin'], {
    required_error: 'Please select a role to sign in as',
  }),
  email: z
    .string()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z
  .object({
    role: z.enum(['student', 'staff', 'admin']).default('student'),
    fullName: z
      .string()
      .min(1, 'Full name is required')
      .min(2, 'Full name must be at least 2 characters')
      .regex(/^[a-zA-Z\s.'-]+$/, 'Name can only contain letters, spaces, and hyphens'),
    email: z
      .string()
      .min(1, 'Institutional email is required')
      .email('Please enter a valid email address')
      .refine(
        (val) => val.trim().toLowerCase().endsWith('@coeptech.ac.in'),
        {
          message: 'Only official college email addresses (@coeptech.ac.in) are permitted',
        }
      ),
    studentId: z
      .string()
      .optional()
      .or(z.literal('')),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: 'You must agree to the Campus Honor Code and Terms of Service',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
