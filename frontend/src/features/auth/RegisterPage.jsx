import { useState, useEffect, useRef } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Wrench,
  GraduationCap,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  UserPlus,
  X,
  Mail,
  KeyRound,
  RotateCw,
  ArrowLeft,
} from 'lucide-react';
import { Button, Input, Card } from '../../components/ui';
import { registerSchema } from '../../lib/validation';
import { useAuth } from './useAuth';
import PasswordToggle from './PasswordToggle';
import PasswordStrengthMeter from './PasswordStrengthMeter';
import AuthNotice from './AuthNotice';

export default function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { register: registerAuthUser, verifyEmail, resendOtp, user, logout } = useAuth();

  // Multi-step lifecycle: 'form' -> 'otp' -> 'success'
  const [step, setStep] = useState('form');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const [registeredName, setRegisteredName] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');

  // OTP State
  const [otpValue, setOtpValue] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [resendNotice, setResendNotice] = useState('');
  const otpInputRef = useRef(null);

  // Form Setup
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

  // Handle countdown timer for OTP resend cooldown
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  // Auto-focus OTP input when entering OTP screen
  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => {
        otpInputRef.current?.focus();
      }, 150);
    }
  }, [step]);

  // Support seamless transition from LandingPage signup form
  useEffect(() => {
    if (location.state?.email) {
      setPendingEmail(location.state.email.trim().toLowerCase());
      if (location.state.name) setRegisteredName(location.state.name);
      setStep('otp');
      setCooldown(60);
    }
  }, [location.state]);

  const handleQuickFill = () => {
    setServerError('');
    clearErrors();
    setValue('fullName', 'Priya Sharma', { shouldValidate: true });
    setValue('email', 'priya.sharma@coeptech.ac.in', { shouldValidate: true });
    setValue('studentId', 'STU-2026-8819', { shouldValidate: true });
    setValue('password', 'CampusPass2026!', { shouldValidate: true });
    setValue('confirmPassword', 'CampusPass2026!', { shouldValidate: true });
    setValue('acceptTerms', true, { shouldValidate: true });
  };

  /**
   * Step 1: Submit initial registration form -> Triggers OTP dispatch
   */
  const onFormSubmit = async (data) => {
    setServerError('');
    try {
      await registerAuthUser({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        studentId: data.studentId,
      });

      setRegisteredName(data.fullName);
      setPendingEmail(data.email.trim().toLowerCase());
      setStep('otp');
      setCooldown(60); // 60s cooldown for resend
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error?.message ||
        err.message ||
        'Registration could not be completed. Please check your information and try again.';
      setServerError(message);
    }
  };

  /**
   * Step 2: Submit 6-digit OTP -> Activates student account
   */
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    if (!otpValue || otpValue.trim().length !== 6) {
      setServerError('Please enter the complete 6-digit verification code.');
      return;
    }

    setServerError('');
    setIsVerifying(true);

    try {
      await verifyEmail({
        email: pendingEmail,
        otp: otpValue.trim(),
      });

      setIsVerifying(false);
      setStep('success');
    } catch (err) {
      setIsVerifying(false);
      const message =
        err.response?.data?.message ||
        err.response?.data?.error?.message ||
        err.message ||
        'Verification failed. Please check the code and try again.';
      setServerError(message);
    }
  };

  /**
   * Resend OTP Action with Cooldown
   */
  const handleResendOtp = async () => {
    if (cooldown > 0 || isResending) return;

    setServerError('');
    setResendNotice('');
    setIsResending(true);

    try {
      const res = await resendOtp({ email: pendingEmail });
      setIsResending(false);
      setCooldown(60);
      setOtpValue('');
      setResendNotice(res.message || 'A fresh verification code has been dispatched to your email.');
    } catch (err) {
      setIsResending(false);
      const message =
        err.response?.data?.message ||
        err.response?.data?.error?.message ||
        'Unable to resend verification code right now. Please wait.';
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
              {step === 'otp' ? <Mail size={24} aria-hidden="true" /> : <Wrench size={24} aria-hidden="true" />}
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-ink">
              {step === 'otp' ? 'Verify Institutional Email' : 'Create Student Account'}
            </h1>
            <p className="mt-1 text-sm text-muted">
              {step === 'otp'
                ? `Enter the 6-digit security code sent to ${pendingEmail}`
                : 'Join CampusFix to report issues and track campus improvements'}
            </p>
          </div>

          {/* Already logged-in banner */}
          {user && step === 'form' && (
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
                    onClick={() => navigate(user.role === 'admin' ? '/admin' : '/feed')}
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

          {/* Resend Success Notice */}
          {resendNotice && (
            <div
              role="status"
              className="mb-5 flex items-start gap-3 rounded-lg border border-success-border bg-success-50 p-3 text-xs text-teal-700 animate-in fade-in"
            >
              <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-teal-600" aria-hidden="true" />
              <div className="flex-1">
                <p>{resendNotice}</p>
              </div>
              <button
                type="button"
                onClick={() => setResendNotice('')}
                className="text-teal-700 hover:opacity-80"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* STEP 1: INITIAL REGISTRATION FORM                             */}
          {/* ------------------------------------------------------------- */}
          {step === 'form' && (
            <>
              {/* Role Clarification Callout */}
              <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-line bg-surface-muted p-3 text-xs text-muted">
                <GraduationCap size={16} className="mt-0.5 shrink-0 text-brand-600" aria-hidden="true" />
                <p>
                  <strong>Institutional Requirement:</strong> Account registration requires an official university email ending in <strong>@coeptech.ac.in</strong>. A verification code will be dispatched to confirm your identity.
                </p>
              </div>

              <form onSubmit={handleSubmit(onFormSubmit)} noValidate className="space-y-4">
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
                    label="Institutional Email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="name@coeptech.ac.in"
                    helperText="Must be your official @coeptech.ac.in address"
                    error={errors.email?.message}
                    disabled={isSubmitting}
                  />
                </div>

                {/* Student ID (Optional) */}
                <div>
                  <Input
                    {...register('studentId')}
                    id="register-studentId"
                    label="Student PRN / ID (Optional)"
                    type="text"
                    autoComplete="off"
                    placeholder="e.g. 112103045"
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

                {/* Privacy Guarantee */}
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
                      <span>Sending verification code...</span>
                    ) : (
                      <>
                        <UserPlus size={16} aria-hidden="true" />
                        <span>Continue to Email Verification</span>
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </>
          )}

          {/* ------------------------------------------------------------- */}
          {/* STEP 2: OTP VERIFICATION SCREEN                               */}
          {/* ------------------------------------------------------------- */}
          {step === 'otp' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="rounded-lg border border-brand-200 bg-brand-50/60 p-3.5 text-xs text-brand-800 flex items-start gap-2.5">
                <Mail size={16} className="shrink-0 text-brand-600 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-medium text-brand-900">Verification code dispatched</p>
                  <p>
                    Please check your institutional inbox at <strong>{pendingEmail}</strong>. Enter the 6-digit numeric code below.
                  </p>
                </div>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label htmlFor="otp-input" className="block text-xs font-semibold text-ink uppercase tracking-wider mb-2">
                    6-Digit Security Code
                  </label>
                  <div className="relative">
                    <input
                      ref={otpInputRef}
                      id="otp-input"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      value={otpValue}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setOtpValue(val);
                      }}
                      placeholder="······"
                      aria-label="6-digit verification code"
                      className="w-full text-center text-3xl font-mono font-bold tracking-[0.5em] py-3.5 px-4 rounded-xl border-2 border-line bg-surface text-ink focus:border-brand-500 focus:ring-4 focus:ring-brand-100 transition-all outline-none"
                      disabled={isVerifying}
                      autoComplete="one-time-code"
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-muted text-center">
                    Code expires in 10 minutes · Single use only
                  </p>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={isVerifying}
                  disabled={isVerifying || otpValue.length !== 6}
                >
                  {isVerifying ? (
                    <span>Verifying code...</span>
                  ) : (
                    <>
                      <KeyRound size={16} aria-hidden="true" />
                      <span>Verify & Activate Account</span>
                    </>
                  )}
                </Button>
              </form>

              {/* Resend & Back Controls */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs border-t border-line">
                <button
                  type="button"
                  onClick={() => {
                    setStep('form');
                    setServerError('');
                  }}
                  className="inline-flex items-center gap-1 font-medium text-muted hover:text-ink transition-colors"
                >
                  <ArrowLeft size={14} />
                  <span>Change email / Edit details</span>
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={cooldown > 0 || isResending}
                  className={`inline-flex items-center gap-1 font-medium transition-colors ${
                    cooldown > 0 || isResending
                      ? 'text-muted cursor-not-allowed opacity-60'
                      : 'text-brand-600 hover:text-brand-700 hover:underline'
                  }`}
                >
                  <RotateCw size={14} className={isResending ? 'animate-spin' : ''} />
                  <span>
                    {cooldown > 0 ? `Resend code (${cooldown}s)` : isResending ? 'Sending...' : 'Resend Code'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* STEP 3: SUCCESS CONFIRMATION                                  */}
          {/* ------------------------------------------------------------- */}
          {step === 'success' && (
            <div
              role="status"
              className="my-4 rounded-lg border border-success-border bg-success-bg p-6 text-center animate-in fade-in zoom-in-95 duration-200"
            >
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-teal text-white">
                <CheckCircle2 size={32} aria-hidden="true" />
              </div>
              <h2 className="text-xl font-bold text-teal-700">Account Verified Successfully!</h2>
              <p className="mt-2 text-sm text-body">
                Welcome to CampusFix, <strong>{registeredName}</strong>! Your institutional email has been confirmed.
                You are now signed in and ready to report facilities issues across campus.
              </p>

              <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => navigate('/feed')}
                >
                  <span>Go to Campus Feed</span>
                  <ArrowRight size={14} className="ml-1" />
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
          )}

          {/* Footer Navigation Link to Login */}
          {step === 'form' && (
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
          )}
        </Card>
      </div>
    </div>
  );
}
