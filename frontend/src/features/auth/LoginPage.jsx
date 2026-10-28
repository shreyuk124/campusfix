import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Wrench,
  GraduationCap,
  Shield,
  HardHat,
  AlertCircle,
  CheckCircle2,
  Lock,
  ArrowRight,
  Zap,
  X,
} from 'lucide-react';
import { Button, Input, Card } from '../../components/ui';
import { loginSchema } from '../../lib/validation';
import { useAuth } from './useAuth';
import PasswordToggle from './PasswordToggle';
import AuthNotice from './AuthNotice';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user, logout } = useAuth();

  const [selectedRole, setSelectedRole] = useState('student');
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Where to redirect after login (default / for student, /admin for admin)
  const fromLocation = location.state?.from?.pathname;

  const {
    register,
    handleSubmit,
    setValue,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm({

    resolver: zodResolver(loginSchema),
    defaultValues: {
      role: 'student',
      email: '',
      password: '',
    },
  });

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setValue('role', role, { shouldValidate: true });
    setServerError('');
    clearErrors();
  };

  const handleQuickFill = () => {
    setServerError('');
    clearErrors();
    if (selectedRole === 'student') {
      setValue('email', 'alex.student@campus.edu', { shouldValidate: true });
      setValue('password', 'CampusPass2026!', { shouldValidate: true });
    } else if (selectedRole === 'staff') {
      setValue('email', 'rajesh.electrician@campusfix.edu', { shouldValidate: true });
      setValue('password', 'StaffPass2026!', { shouldValidate: true });
    } else {
      setValue('email', 'sarah.admin@campusfix.edu', { shouldValidate: true });
      setValue('password', 'AdminSecret2026!', { shouldValidate: true });
    }
  };

  const onSubmit = async (data) => {
    setServerError('');
    try {
      const loggedUser = await login({
        email: data.email,
        password: data.password,
        role: selectedRole,
      });

      setLoginSuccess(true);

      // Brief delay to display success state before routing
      setTimeout(() => {
        if (fromLocation) {
          navigate(fromLocation, { replace: true });
        } else if (loggedUser.role === 'admin') {
          navigate('/admin', { replace: true });
        } else if (loggedUser.role === 'staff') {
          navigate('/staff', { replace: true });
        } else {
          navigate('/feed', { replace: true });
        }
      }, 700);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        'Email or password is incorrect. Please verify your credentials and try again.';
      setServerError(message);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-16rem)] items-center justify-center py-6 sm:py-10">
      <div className="w-full max-w-[440px]">
        {/* Prototype & Security Notice Banner */}
        <AuthNotice onQuickFill={handleQuickFill} role={selectedRole} isRegister={false} />

        <Card className="shadow-modal">
          {/* Brand & Page Header */}
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500 text-white shadow-sm ring-4 ring-brand-100">
              <Wrench size={24} aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-ink">
              Sign In to CampusFix
            </h1>
            <p className="mt-1 text-sm text-muted">
              Campus issue reporting & facility resolution platform
            </p>
          </div>

          {/* Already logged-in banner */}
          {user && !loginSuccess && (
            <div className="mb-6 rounded-lg border border-brand-200 bg-brand-50 p-4 text-sm text-brand-700">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-ink">Currently signed in as:</p>
                  <p className="text-xs text-muted">
                    {user.name} ({user.role === 'admin' ? 'Campus Admin' : user.role === 'staff' ? 'Maintenance Staff' : 'Student'})
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => navigate(user.role === 'admin' ? '/admin' : user.role === 'staff' ? '/staff' : '/feed')}
                  >
                    Go to {user.role === 'admin' ? 'Admin' : user.role === 'staff' ? 'Staff Portal' : 'Feed'}
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

          {/* Success state display */}
          {loginSuccess ? (
            <div
              role="status"
              className="my-6 rounded-lg border border-success-border bg-success-bg p-6 text-center animate-in fade-in zoom-in-95 duration-200"
            >
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-teal text-white">
                <CheckCircle2 size={26} aria-hidden="true" />
              </div>
              <h2 className="text-lg font-bold text-teal-700">
                Authentication Successful
              </h2>
              <p className="mt-1 text-sm text-body">
                Welcome back! Redirecting you to your workspace...
              </p>
            </div>
          ) : (
            <>
              {/* Role Switcher: Student vs Staff vs Admin */}
              <div className="mb-6">
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted">
                  Sign in as
                </label>
                <div
                  role="tablist"
                  aria-label="Select role to sign in as"
                  className="grid grid-cols-2 gap-1 rounded-lg border border-line bg-surface-muted p-1"
                >
                  <button
                    type="button"
                    role="tab"
                    id="role-tab-student"
                    aria-selected={selectedRole === 'student'}
                    onClick={() => handleRoleChange('student')}
                    className={`flex items-center justify-center gap-1.5 rounded-md py-2.5 text-xs sm:text-sm font-medium transition-all ${
                      selectedRole === 'student'
                        ? 'bg-surface text-brand-600 shadow-sm font-semibold'
                        : 'text-muted hover:text-ink'
                    }`}
                  >
                    <GraduationCap size={16} aria-hidden="true" />
                    <span>Student</span>
                  </button>

                  <button
                    type="button"
                    role="tab"
                    id="role-tab-admin"
                    aria-selected={selectedRole === 'admin'}
                    onClick={() => handleRoleChange('admin')}
                    className={`flex items-center justify-center gap-1.5 rounded-md py-2.5 text-xs sm:text-sm font-medium transition-all ${
                      selectedRole === 'admin'
                        ? 'bg-surface text-brand-600 shadow-sm font-semibold'
                        : 'text-muted hover:text-ink'
                    }`}
                  >
                    <Shield size={16} aria-hidden="true" />
                    <span>Admin</span>
                  </button>
                </div>

                <p className="mt-1.5 text-xs text-muted">
                  {selectedRole === 'admin'
                    ? 'Manage issue triage, assign resolution teams, and monitor SLAs.'
                    : 'Report broken campus facilities, vote, and track resolution timelines.'}
                </p>

                <button
                  type="button"
                  onClick={handleQuickFill}
                  className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50/80 py-2 text-xs font-semibold text-brand-700 hover:bg-brand-100 transition-colors shadow-xs"
                >
                  <Zap size={14} className="text-brand-600" />
                  <span>1-Click Demo Fill ({selectedRole === 'admin' ? 'Admin' : 'Student'})</span>
                </button>
              </div>

              {/* Failed-Login State / Server Error Alert */}
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

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                {/* Hidden input for registered role */}
                <input type="hidden" {...register('role')} value={selectedRole} />

                {/* Email Field */}
                <div>
                  <Input
                    {...register('email')}
                    id="login-email"
                    label={
                      selectedRole === 'admin'
                        ? 'Admin Email Address'
                        : 'University Email Address'
                    }
                    type="email"
                    required
                    autoComplete="email"
                    placeholder={
                      selectedRole === 'admin'
                        ? 'admin@campusfix.edu'
                        : 'student@university.edu'
                    }
                    helperText={
                      selectedRole === 'admin'
                        ? 'Use your university-issued administrative credentials'
                        : 'Official student email address'
                    }
                    error={errors.email?.message}
                    disabled={isSubmitting}
                  />
                </div>

                {/* Password Field with Visibility Toggle */}
                <div>
                  <Input
                    {...register('password')}
                    id="login-password"
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    placeholder="Enter your account password"
                    helperText="At least 8 characters"
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
                </div>

                {/* Submit Action Button */}
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
                      <span>Signing in...</span>
                    ) : (
                      <>
                        <Lock size={16} aria-hidden="true" />
                        <span>
                          Sign In as {selectedRole === 'admin' ? 'Admin' : 'Student'}
                        </span>
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </>
          )}

          {/* Footer Navigation Link to Register */}
          <div className="mt-6 border-t border-line pt-4 text-center">
            {selectedRole === 'student' ? (
              <p className="text-sm text-muted">
                New to CampusFix?{' '}
                <Link
                  to="/register"
                  className="font-medium text-brand-600 hover:text-brand-700 hover:underline inline-flex items-center gap-0.5"
                >
                  <span>Create a student account</span>
                  <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </p>
            ) : (
              <p className="text-xs text-muted">
                Administrator accounts are provisioned by Campus IT. Need access?{' '}
                <span className="text-body font-medium">Contact facility administration</span>.
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}