import { z } from 'zod';

export const loginSchema = z.object({
  role: z.enum(['student', 'staff', 'admin'], {
    required_error: 'Please select a role to sign in as',
  }),
  email: z
    .string()
    .min(1, 'Email address is required')
    .email('Please enter a valid university email address (e.g. name@university.edu)'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters'),
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
      .min(1, 'University email is required')
      .email('Please enter a valid university email address (e.g. name@university.edu)'),
    studentId: z
      .string()
      .optional()
      .or(z.literal('')),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Za-z]/, 'Password must include at least one letter')
      .regex(/[0-9]/, 'Password must include at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: 'You must agree to the Campus Honor Code and Terms of Service',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
