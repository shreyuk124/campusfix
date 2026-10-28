import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Wrench,
  GraduationCap,
  HardHat,
  Shield,
  CheckCircle2,
  AlertCircle,
  Lock,
  ArrowRight,
  Zap,
  Eye,
  EyeOff,
  Sparkles,
  Layers,
  Check,
  UserCheck,
} from 'lucide-react';
import { Button, Input, Card } from '../../components/ui';
import { loginSchema, registerSchema } from '../../lib/validation';
import { useAuth } from '../auth/useAuth';

export default function LandingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login, register: registerUser, logout } = useAuth();

  // Active Tab: 'signin' | 'signup'
  const [authMode, setAuthMode] = useState('signin');
  // Selected Role: 'student' | 'staff' | 'admin'
  const [selectedRole, setSelectedRole] = useState('student');
  // Password Visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  // Status & Feedback
  const [serverError, setServerError] = useState('');
  const [authSuccess, setAuthSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Target location if redirected from protected route
  const fromLocation = location.state?.from?.pathname;

  // Ensure landing page always starts at top
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
  }, [location.pathname]);

  // --- Sign In Form Setup ---
  const {
    register: loginRegister,
    handleSubmit: handleLoginSubmit,
    setValue: setLoginValue,
    clearErrors: clearLoginErrors,
    formState: { errors: loginErrors, isSubmitting: isLoginSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      role: 'student',
      email: '',
      password: '',
    },
  });

  // --- Sign Up Form Setup ---
  const {
    register: signupRegister,
    handleSubmit: handleSignupSubmit,
    setValue: setSignupValue,
    clearErrors: clearSignupErrors,
    formState: { errors: signupErrors, isSubmitting: isSignupSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'student',
      fullName: '',
      email: '',
      studentId: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
  });

  // Role Change Handler
  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setLoginValue('role', role, { shouldValidate: true });
    setSignupValue('role', role, { shouldValidate: true });
    setServerError('');
    clearLoginErrors();
    clearSignupErrors();
  };

  // 1-Click Demo Credentials Autofill
  const handleQuickFill = () => {
    setServerError('');
    clearLoginErrors();
    clearSignupErrors();

    if (authMode === 'signin') {
      if (selectedRole === 'student') {
        setLoginValue('email', 'alex.student@campus.edu', { shouldValidate: true });
        setLoginValue('password', 'CampusPass2026!', { shouldValidate: true });
      } else if (selectedRole === 'staff') {
        setLoginValue('email', 'rajesh.electrician@campusfix.edu', { shouldValidate: true });
        setLoginValue('password', 'StaffPass2026!', { shouldValidate: true });
      } else {
        setLoginValue('email', 'sarah.admin@campusfix.edu', { shouldValidate: true });
        setLoginValue('password', 'AdminSecret2026!', { shouldValidate: true });
      }
    } else {
      // Sign Up autofill
      setSignupValue('fullName', selectedRole === 'student' ? 'Rohit Deshmukh' : selectedRole === 'staff' ? 'Sunil Kamble' : 'Admin Sarthak', { shouldValidate: true });
      setSignupValue('email', selectedRole === 'student' ? 'rohit.deshmukh@campus.edu' : selectedRole === 'staff' ? 'sunil.maintenance@campusfix.edu' : 'sarthak.admin@campusfix.edu', { shouldValidate: true });
      setSignupValue('studentId', selectedRole === 'student' ? 'ST-2026-9041' : 'STF-502', { shouldValidate: true });
      setSignupValue('password', 'CampusFix2026!', { shouldValidate: true });
      setSignupValue('confirmPassword', 'CampusFix2026!', { shouldValidate: true });
      setSignupValue('acceptTerms', true, { shouldValidate: true });
    }
  };

  // Navigate user strictly based on their assigned role
  const navigateByRole = (role) => {
    const r = (role || 'student').toLowerCase();
    if (r === 'admin') {
      navigate('/admin', { replace: true });
    } else if (r === 'staff') {
      navigate('/staff', { replace: true });
    } else {
      navigate(fromLocation || '/feed', { replace: true });
    }
  };

  // Submission: Sign In
  const onLoginSubmit = async (formData) => {
    setServerError('');
    setAuthSuccess(false);

    try {
      const authUser = await login({
        email: formData.email,
        password: formData.password,
        role: formData.role || selectedRole,
      });

      setAuthSuccess(true);
      const roleTitle = authUser.role === 'admin' ? 'Campus Admin' : authUser.role === 'staff' ? 'Facilities Staff' : 'Student';
      setSuccessMessage(`Welcome back, ${authUser.name}! Redirecting to ${roleTitle} portal...`);

      setTimeout(() => {
        navigateByRole(authUser.role);
      }, 700);
    } catch (err) {
      console.error('Sign in error:', err);
      const message =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        err.message ||
        'Invalid university credentials or unauthorized role.';
      setServerError(message);
    }
  };

  // Submission: Sign Up (Student Only)
  const onSignupSubmit = async (formData) => {
    setServerError('');
    setAuthSuccess(false);

    try {
      const res = await registerUser({
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: 'student',
        studentId: formData.studentId,
      });

      if (res?.requiresOtp) {
        navigate('/register', {
          replace: true,
          state: { email: formData.email, name: formData.fullName },
        });
        return;
      }

      setAuthSuccess(true);
      setSuccessMessage(`Account created for ${res?.name || formData.fullName}! Taking you to your campus feed...`);

      setTimeout(() => {
        navigate('/feed', { replace: true });
      }, 700);
    } catch (err) {
      console.error('Registration error:', err);
      const message =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        err.message ||
        'Registration failed. This email may already be in use.';
      setServerError(message);
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-between selection:bg-brand-500 selection:text-white">
      {/* Top University Header Bar */}
      <header className="border-b border-line bg-surface/90 backdrop-blur-md sticky top-0 z-30">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 text-white shadow-xs">
              <Wrench size={22} strokeWidth={2.2} />
            </span>
            <div>
              <span className="text-xl font-bold tracking-tight text-ink">CampusFix</span>
              <p className="text-[11px] text-muted hidden sm:block">
                Campus Infrastructure &amp; Maintenance Resolution
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-muted font-medium">
            <span className="inline-flex items-center gap-1.5 text-teal-700 font-semibold bg-teal-50 border border-teal-200/80 px-2.5 py-1 rounded-full">
              <span className="h-1.5 w-1.5 rounded-full bg-teal animate-pulse" />
              Live System
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Top Hero: Title & Tagline (No paragraph) */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 mb-3">
            <Sparkles size={14} className="text-brand-500" />
            <span>Zero Clutter • Transparent Resolution</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-ink leading-tight">
            Report it. Track it.{' '}
            <span className="text-brand-500 underline decoration-brand-200 underline-offset-4">
              See it fixed.
            </span>
          </h1>
        </div>

        {/* TOP SECTION: The Auth Gateway (Login / Signup) Centered */}
        <div className="max-w-xl mx-auto w-full mb-12">
          <Card className="shadow-modal border-line-strong p-6 sm:p-8 relative bg-surface">
            {/* Already Logged In Banner */}
            {user && !authSuccess && (
              <div className="mb-6 rounded-xl border border-brand-200 bg-brand-50 p-4 text-sm text-brand-900 animate-in fade-in">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-ink text-sm">Currently Active Session</p>
                    <p className="text-xs text-muted mt-0.5">
                      Signed in as <strong className="text-ink">{user.name}</strong> ({user.role?.toUpperCase()})
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => logout()}
                    className="text-xs text-danger font-semibold hover:underline"
                  >
                    Sign Out
                  </button>
                </div>

                <div className="mt-4 pt-3 border-t border-brand-200/70">
                  <Button
                    variant="primary"
                    size="md"
                    fullWidth
                    onClick={() => navigateByRole(user.role)}
                    className="gap-2"
                  >
                    <span>Continue to {user.role === 'admin' ? 'Authority Portal' : 'Student Feed'}</span>
                    <ArrowRight size={16} />
                  </Button>
                </div>
              </div>
            )}

            {/* Success Notification during redirection */}
            {authSuccess ? (
              <div className="my-8 rounded-xl border border-success-border bg-success-bg p-6 text-center animate-in zoom-in-95 duration-200">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-teal text-white shadow-xs">
                  <CheckCircle2 size={28} />
                </div>
                <h3 className="text-lg font-bold text-teal-700">Authentication Confirmed</h3>
                <p className="mt-1 text-sm text-body">{successMessage}</p>
              </div>
            ) : (
              <>
                {/* Top Switcher: Sign In vs Sign Up */}
                <div className="mb-5 flex rounded-lg bg-surface-muted p-1 border border-line">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('signin');
                      setServerError('');
                    }}
                    className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-md transition-all ${
                      authMode === 'signin'
                        ? 'bg-surface text-brand-600 shadow-sm border border-line/60'
                        : 'text-muted hover:text-ink'
                    }`}
                  >
                    Sign In
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('signup');
                      setSelectedRole('student');
                      setLoginValue('role', 'student');
                      setSignupValue('role', 'student');
                      setServerError('');
                    }}
                    className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-md transition-all ${
                      authMode === 'signup'
                        ? 'bg-surface text-brand-600 shadow-sm border border-line/60'
                        : 'text-muted hover:text-ink'
                    }`}
                  >
                    Create Account
                  </button>
                </div>

                {/* Role Selector: Only for Sign In */}
                {authMode === 'signin' ? (
                  <div className="mb-5">
                    <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-muted">
                      Select Your Role
                    </label>
                    <div className="grid grid-cols-2 gap-1 rounded-lg border border-line bg-surface-muted p-1">
                      <button
                        type="button"
                        onClick={() => handleRoleChange('student')}
                        className={`flex items-center justify-center gap-1.5 rounded-md py-2 text-xs font-semibold transition-all ${
                          selectedRole === 'student'
                            ? 'bg-surface text-brand-600 shadow-xs border border-line/50'
                            : 'text-muted hover:text-ink'
                        }`}
                      >
                        <GraduationCap size={15} />
                        <span>Student</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRoleChange('admin')}
                        className={`flex items-center justify-center gap-1.5 rounded-md py-2 text-xs font-semibold transition-all ${
                          selectedRole === 'admin'
                            ? 'bg-surface text-brand-600 shadow-xs border border-line/50'
                            : 'text-muted hover:text-ink'
                        }`}
                      >
                        <Shield size={15} />
                        <span>Admin</span>
                      </button>
                    </div>

                    <p className="mt-1.5 text-[11px] text-muted">
                      {selectedRole === 'admin'
                        ? 'Estate authorities triage tickets, dispatch crews, and oversee campus repairs.'
                        : 'Students report issues, upvote active complaints, and track repairs.'}
                    </p>

                    {/* 1-Click Demo Fill Action */}
                    {selectedRole === 'admin' && (
                      <button
                        type="button"
                        onClick={handleQuickFill}
                        className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50/90 py-2 text-xs font-semibold text-brand-700 hover:bg-brand-100 transition-colors shadow-xs"
                      >
                        <Zap size={14} className="text-brand-600 fill-brand-600" />
                        <span>
                          1-Click Demo Fill (Admin)
                        </span>
                      </button>
                    )}
                  </div>
                ) : (
                  /* Sign Up is strictly for Students */
                  <div className="mb-5 rounded-lg border border-brand-200/80 bg-brand-50/70 p-3.5">
                    <div className="flex items-center gap-2 text-brand-700 font-semibold text-xs">
                      <GraduationCap size={16} />
                      <span>Student Self-Registration</span>
                    </div>
                    <p className="mt-1 text-[11px] text-muted leading-relaxed">
                      Create your verified student account using your campus email.
                    </p>
                  </div>
                )}

                {/* Server / Auth Error Alert */}
                {serverError && (
                  <div
                    role="alert"
                    className="mb-4 flex items-start gap-2.5 rounded-lg border border-danger-border bg-danger-50 p-3 text-xs text-danger animate-in fade-in"
                  >
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <span className="font-medium leading-relaxed">{serverError}</span>
                  </div>
                )}

                {/* FORM A: SIGN IN */}
                {authMode === 'signin' && (
                  <form onSubmit={handleLoginSubmit(onLoginSubmit)} noValidate className="space-y-4">
                    <input type="hidden" {...loginRegister('role')} value={selectedRole} />

                    <div>
                      <Input
                        {...loginRegister('email')}
                        id="landing-login-email"
                        type="email"
                        label={
                          selectedRole === 'admin'
                            ? 'Admin Email Address'
                            : 'Student University Email'
                        }
                        required
                        placeholder={
                          selectedRole === 'admin'
                            ? 'admin@campusfix.edu'
                            : 'alex.student@campus.edu'
                        }
                        error={loginErrors.email?.message}
                        disabled={isLoginSubmitting}
                      />
                    </div>

                    <div>
                      <div className="relative">
                        <Input
                          {...loginRegister('password')}
                          id="landing-login-password"
                          type={showPassword ? 'text' : 'password'}
                          label="Password"
                          required
                          placeholder="Enter your account password"
                          error={loginErrors.password?.message}
                          disabled={isLoginSubmitting}
                          endAdornment={
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="text-muted hover:text-ink focus:outline-none"
                              aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          }
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        fullWidth
                        loading={isLoginSubmitting}
                        disabled={isLoginSubmitting}
                        className="shadow-sm"
                      >
                        <Lock size={15} />
                        <span>
                          Sign In as {selectedRole === 'admin' ? 'Admin' : 'Student'}
                        </span>
                      </Button>
                    </div>
                  </form>
                )}

                {/* FORM B: SIGN UP */}
                {authMode === 'signup' && (
                  <form onSubmit={handleSignupSubmit(onSignupSubmit)} noValidate className="space-y-3.5">
                    <input type="hidden" {...signupRegister('role')} value={selectedRole} />

                    <div>
                      <Input
                        {...signupRegister('fullName')}
                        id="landing-signup-name"
                        label="Full Legal Name"
                        required
                        placeholder="e.g. Alex Sharma"
                        error={signupErrors.fullName?.message}
                        disabled={isSignupSubmitting}
                      />
                    </div>

                    <div>
                      <Input
                        {...signupRegister('email')}
                        id="landing-signup-email"
                        type="email"
                        label="Official Campus Email"
                        required
                        placeholder="name@campus.edu"
                        error={signupErrors.email?.message}
                        disabled={isSignupSubmitting}
                      />
                    </div>

                    {selectedRole === 'student' && (
                      <div>
                        <Input
                          {...signupRegister('studentId')}
                          id="landing-signup-studentid"
                          label="Student PRN / ID (Optional)"
                          placeholder="e.g. 112103045"
                          error={signupErrors.studentId?.message}
                          disabled={isSignupSubmitting}
                        />
                      </div>
                    )}

                    <div>
                      <Input
                        {...signupRegister('password')}
                        id="landing-signup-password"
                        type={showPassword ? 'text' : 'password'}
                        label="Create Password"
                        required
                        placeholder="At least 8 characters with letter & number"
                        error={signupErrors.password?.message}
                        disabled={isSignupSubmitting}
                        endAdornment={
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-muted hover:text-ink focus:outline-none"
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                          >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        }
                      />
                    </div>

                    <div>
                      <Input
                        {...signupRegister('confirmPassword')}
                        id="landing-signup-confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        label="Confirm Password"
                        required
                        placeholder="Re-enter password"
                        error={signupErrors.confirmPassword?.message}
                        disabled={isSignupSubmitting}
                        endAdornment={
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="text-muted hover:text-ink focus:outline-none"
                            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                          >
                            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        }
                      />
                    </div>

                    <div className="pt-1">
                      <label className="flex items-start gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          {...signupRegister('acceptTerms')}
                          className="mt-0.5 rounded border-line-strong text-brand-500 focus:ring-brand-200"
                        />
                        <span className="text-[11px] text-muted leading-tight">
                          I agree to the Campus Honor Code and agree to submit authentic maintenance reports.
                        </span>
                      </label>
                      {signupErrors.acceptTerms && (
                        <p className="mt-1 text-xs text-danger font-medium">{signupErrors.acceptTerms.message}</p>
                      )}
                    </div>

                    <div className="pt-2">
                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        fullWidth
                        loading={isSignupSubmitting}
                        disabled={isSignupSubmitting}
                        className="shadow-sm"
                      >
                        <UserCheck size={15} />
                        <span>Create Student Account</span>
                      </Button>
                      <p className="mt-3 text-center text-[11px] text-muted">
                        Staff &amp; Admin accounts are provisioned directly by Campus IT.
                      </p>
                    </div>
                  </form>
                )}
              </>
            )}
          </Card>
        </div>

        {/* BELOW SECTION: "How CampusFix Works" (3-Step Flow) */}
        <div className="max-w-5xl mx-auto w-full space-y-4 pt-6 border-t border-line/60">
          <div className="flex items-center justify-between pb-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
              <Layers size={14} className="text-brand-600" />
              <span>How CampusFix Works</span>
            </h2>
            <span className="text-xs text-brand-600 font-medium">3 Simple Steps</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* Step 1 */}
            <div className="rounded-xl border border-line bg-surface p-4 shadow-card hover:border-brand-200 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600 font-bold text-xs">
                  01
                </span>
                <span className="text-[11px] font-semibold text-brand-600 uppercase tracking-wider">Report</span>
              </div>
              <h3 className="text-sm font-bold text-ink">Spot &amp; Describe</h3>
              <p className="mt-1 text-xs text-muted leading-relaxed">
                Pick your campus building and category. Add room number and optional photos.
              </p>
            </div>

            {/* Step 2 */}
            <div className="rounded-xl border border-line bg-surface p-4 shadow-card hover:border-brand-200 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange font-bold text-xs">
                  02
                </span>
                <span className="text-[11px] font-semibold text-orange uppercase tracking-wider">Auto-Dedupe</span>
              </div>
              <h3 className="text-sm font-bold text-ink">Early Intercept</h3>
              <p className="mt-1 text-xs text-muted leading-relaxed">
                Matching issues are intercepted early. Tap &quot;+1 Mark affected&quot; to boost priority without duplicates.
              </p>
            </div>

            {/* Step 3 */}
            <div className="rounded-xl border border-line bg-surface p-4 shadow-card hover:border-brand-200 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal font-bold text-xs">
                  03
                </span>
                <span className="text-[11px] font-semibold text-teal uppercase tracking-wider">Resolve</span>
              </div>
              <h3 className="text-sm font-bold text-ink">Live Triage &amp; Fix</h3>
              <p className="mt-1 text-xs text-muted leading-relaxed">
                Estate authorities assign maintenance crews with transparent real-time status progression.
              </p>
            </div>
          </div>

          {/* Trust & Privacy Badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-6 text-xs font-medium text-muted">
            <span className="inline-flex items-center gap-1.5 text-body">
              <Check size={14} className="text-teal" />
              Verified Student Identity
            </span>
            <span className="inline-flex items-center gap-1.5 text-body">
              <Check size={14} className="text-teal" />
              Anonymous Public Feed
            </span>
            <span className="inline-flex items-center gap-1.5 text-body">
              <Check size={14} className="text-teal" />
              Role-Based Authority Triage
            </span>
          </div>
        </div>
      </main>

      {/* Modern Minimal Footer */}
      <footer className="border-t border-line bg-surface/60 py-6 text-center text-xs text-muted">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} CampusFix — COEP Campus Maintenance &amp; Estate System.</span>
          <span className="text-[11px] text-muted">Protected under University Campus Facility Operations.</span>
        </div>
      </footer>
    </div>
  );
}
