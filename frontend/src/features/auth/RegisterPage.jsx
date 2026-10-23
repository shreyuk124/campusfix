import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import {
  Wrench,
  GraduationCap,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  UserPlus,
  X,
} from 'lucide-react';
import { Button, Input, Card } from '../../components/ui';
import { registerSchema } from '../../lib/validation';
import { useAuth } from './useAuth';
import PasswordToggle from './PasswordToggle';
import PasswordStrengthMeter from './PasswordStrengthMeter';
import AuthNotice from './AuthNotice';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register: registerAuthUser, user, logout } = useAuth();


  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [registeredName, setRegisteredName] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    control,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      studentId: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
  });

  const passwordValue = useWatch({ control, name: 'password', defaultValue: '' });


  const handleQuickFill = () => {
    setServerError('');
    clearErrors();
    setValue('fullName', 'Priya Sharma', { shouldValidate: true });
    setValue('email', 'priya.sharma@campus.edu', { shouldValidate: true });
    setValue('studentId', 'STU-2026-8819', { shouldValidate: true });
    setValue('password', 'CampusPass2026!', { shouldValidate: true });
    setValue('confirmPassword', 'CampusPass2026!', { shouldValidate: true });
    setValue('acceptTerms', true, { shouldValidate: true });
  };

  const onSubmit = async (data) => {
    setServerError('');
    try {
      const newUser = await registerAuthUser({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        studentId: data.studentId,
      });

      setRegisteredName(newUser.name || data.fullName);
      setIsSuccess(true);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        'Registration could not be completed. Please check your information or try again.';
      setServerError(message);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-16rem)] items-center justify-center py-6 sm:py-10">
      <div className="w-full max-w-[480px]">
        {/* Prototype & Security Notice Banner */}
        <AuthNotice onQuickFill={handleQuickFill} role="student" isRegister={true} />

        <Card className="shadow-modal">
          {/* Header */}
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500 text-white shadow-sm ring-4 ring-brand-100">
              <Wrench size={24} aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-ink">
              Create Student Account
            </h1>
            <p className="mt-1 text-sm text-muted">
              Join CampusFix to report issues and track campus improvements
            </p>
          </div>

          {/* Already logged-in banner */}
          {user && !isSuccess && (
            <div className="mb-6 rounded-lg border border-brand-200 bg-brand-50 p-4 text-sm text-brand-700">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-ink">Currently signed in as:</p>
                  <p className="text-xs text-muted">
                    {user.name} ({user.role === 'admin' ? 'Campus Admin' : 'Student'})
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => navigate(user.role === 'admin' ? '/admin' : '/')}
                  >
                    Go to {user.role === 'admin' ? 'Admin' : 'Feed'}
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => logout()}
                  >
                    Sign out
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Role Clarification Callout per DESIGN.md §5.1 */}
          <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-line bg-surface-muted p-3 text-xs text-muted">
            <GraduationCap size={16} className="mt-0.5 shrink-0 text-brand-600" aria-hidden="true" />
            <p>
              <strong>Students Only:</strong> Campus registration is for students. Administrator
              accounts are provisioned directly by campus IT management.
            </p>
          </div>

          {/* Success Screen */}
          {isSuccess ? (
            <div
              role="status"
              className="my-4 rounded-lg border border-success-border bg-success-bg p-6 text-center animate-in fade-in zoom-in-95 duration-200"
            >
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-teal text-white">
                <CheckCircle2 size={32} aria-hidden="true" />
              </div>
              <h2 className="text-xl font-bold text-teal-700">Account Created Successfully</h2>
              <p className="mt-2 text-sm text-body">
                Welcome, <strong>{registeredName}</strong>! Your student account is active.
                You can now report broken facilities, upvote recurring issues, and receive resolution updates.
              </p>

              <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => navigate('/')}
                >
                  Go to Campus Feed
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => navigate('/report')}
                >
                  Report an Issue
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Failed Registration / Server Error Alert */}
              {serverError && (
                <div
                  role="alert"
                  className="mb-5 flex items-start gap-3 rounded-lg border border-danger-border bg-danger-50 p-3.5 text-sm text-danger animate-in fade-in"
                >
                  <AlertCircle size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
                  <div className="flex-1">
                    <p className="font-medium text-danger">{serverError}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setServerError('')}
                    className="text-danger hover:opacity-80"
                    aria-label="Dismiss error"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {/* Registration Form */}
              <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                {/* Full Name */}
                <div>
                  <Input
                    {...register('fullName')}
                    id="register-fullName"
                    label="Full Name"
                    type="text"
                    required
                    autoComplete="name"
                    placeholder="e.g. Priya Sharma"
                    helperText="Your official name as registered with the university"
                    error={errors.fullName?.message}
                    disabled={isSubmitting}
                  />
                </div>

                {/* University Email */}
                <div>
                  <Input
                    {...register('email')}
                    id="register-email"
                    label="University Email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="priya.sharma@campus.edu"
                    helperText="Must be a valid campus email address"
                    error={errors.email?.message}
                    disabled={isSubmitting}
                  />
                </div>

                {/* Student ID (Optional) */}
                <div>
                  <Input
                    {...register('studentId')}
                    id="register-studentId"
                    label="Student ID (Optional)"
                    type="text"
                    autoComplete="off"
                    placeholder="e.g. STU-2026-8819"
                    helperText="Helps verify student identity and department access"
                    error={errors.studentId?.message}
                    disabled={isSubmitting}
                  />
                </div>

                {/* Password Field */}
                <div>
                  <Input
                    {...register('password')}
                    id="register-password"
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    placeholder="Create a secure password"
                    error={errors.password?.message}
                    disabled={isSubmitting}
                    endAdornment={
                      <PasswordToggle
                        isVisible={showPassword}
                        onToggle={() => setShowPassword(!showPassword)}
                        ariaLabel={showPassword ? 'Hide password' : 'Show password'}
                        disabled={isSubmitting}
                      />
                    }
                  />
                  {/* Dynamic Password Strength Indicator */}
                  <PasswordStrengthMeter password={passwordValue} />
                </div>

                {/* Confirm Password Field */}
                <div>
                  <Input
                    {...register('confirmPassword')}
                    id="register-confirmPassword"
                    label="Confirm Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    placeholder="Re-enter your password"
                    helperText="Must match the password entered above"
                    error={errors.confirmPassword?.message}
                    disabled={isSubmitting}
                    endAdornment={
                      <PasswordToggle
                        isVisible={showConfirmPassword}
                        onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
                        ariaLabel={showConfirmPassword ? 'Hide password' : 'Show password'}
                        disabled={isSubmitting}
                      />
                    }
                  />
                </div>

                {/* Honor Code & Terms Agreement */}
                <div className="pt-1">
                  <div className="flex items-start gap-2.5">
                    <input
                      {...register('acceptTerms')}
                      id="register-terms"
                      type="checkbox"
                      disabled={isSubmitting}
                      className="mt-1 h-4 w-4 rounded border-line-strong text-brand-500 focus:ring-brand-500"
                    />
                    <label htmlFor="register-terms" className="text-xs text-body leading-relaxed">
                      I agree to the <span className="font-medium text-ink">Campus Community Honor Code</span> and commit to submitting truthful, constructive facility reports.
                    </label>
                  </div>
                  {errors.acceptTerms && (
                    <p role="alert" className="mt-1 flex items-start gap-1 text-xs text-danger">
                      <AlertCircle size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
                      <span>{errors.acceptTerms.message}</span>
                    </p>
                  )}
                </div>

                {/* Privacy Reminder per DESIGN.md §9 */}
                <div className="rounded-md bg-brand-50/50 p-2.5 text-[11px] text-muted flex items-start gap-2 border border-brand-100">
                  <ShieldCheck size={14} className="shrink-0 text-brand-500 mt-0.5" />
                  <span>
                    <strong>Student Privacy Guarantee:</strong> Your name and email are never shown to other students in campus feeds or issue discussions.
                  </span>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    loading={isSubmitting}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span>Creating student account...</span>
                    ) : (
                      <>
                        <UserPlus size={16} aria-hidden="true" />
                        <span>Create Student Account</span>
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </>
          )}

          {/* Footer Navigation Link to Login */}
          <div className="mt-6 border-t border-line pt-4 text-center">
            <p className="text-sm text-muted">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-brand-600 hover:text-brand-700 hover:underline inline-flex items-center gap-0.5"
              >
                <span>Sign in</span>
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
