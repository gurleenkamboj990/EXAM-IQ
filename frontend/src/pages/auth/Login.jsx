import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, ShieldCheck, GraduationCap, School, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

import { loginSchema } from '../../utils/validators';
import { authApi } from '../../api/authApi';
import { useAuthStore } from '../../store/authStore';
import { DEMO_CREDENTIALS, ROLE_DASHBOARDS, ROLES, APP_CONFIG } from '../../utils/constants';

import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, user } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already authenticated, redirect to their role dashboard
  React.useEffect(() => {
    if (isAuthenticated && user?.role) {
      const redirectPath = location.state?.from?.pathname || ROLE_DASHBOARDS[user.role] || '/';
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, user, navigate, location]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: true,
    },
  });

  const performLogin = async (credentials) => {
    setIsSubmitting(true);
    try {
      const result = await authApi.login(credentials);
      login(result.user, result.accessToken, result.refreshToken);
      toast.success(`Welcome back, ${result.user.name}!`);

      const destination =
        location.state?.from?.pathname || ROLE_DASHBOARDS[result.user.role] || '/';
      navigate(destination, { replace: true });
    } catch (err) {
      toast.error(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = (data) => {
    performLogin(data);
  };

  const handleQuickLogin = (email, password) => {
    setValue('email', email, { shouldValidate: true });
    setValue('password', password, { shouldValidate: true });
    performLogin({ email, password });
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand Logo */}
        <Link to="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 via-primary-600 to-indigo-500 flex items-center justify-center text-white font-black text-2xl shadow-soft-md group-hover:scale-105 transition-transform">
            IQ
          </div>
          <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            {APP_CONFIG.NAME}
          </span>
        </Link>

        <h2 className="mt-6 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Sign in to your account
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Enter your credentials or test with one-click demo profiles
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 sm:px-10 shadow-soft-lg rounded-2xl border border-slate-200/80 dark:border-slate-800">
          {/* Quick Demo Access Pills */}
          <div className="mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 text-center">
              Quick Demo Access (Click to Login)
            </p>
            <div className="grid grid-cols-3 gap-2">
              {DEMO_CREDENTIALS.map((demo) => {
                const Icon =
                  demo.role === ROLES.ADMIN
                    ? ShieldCheck
                    : demo.role === ROLES.TEACHER
                    ? School
                    : GraduationCap;

                return (
                  <button
                    key={demo.role}
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleQuickLogin(demo.email, demo.password)}
                    className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-brand-50 hover:border-brand-300 dark:hover:bg-slate-800 dark:hover:border-brand-500 text-slate-700 dark:text-slate-300 transition-all group"
                  >
                    <Icon className="w-5 h-5 text-brand-600 dark:text-brand-400 mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold leading-tight">{demo.label}</span>
                    <span className="text-[10px] text-slate-400 font-mono mt-0.5">Demo</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              placeholder="name@examiq.com"
              leftIcon={Mail}
              error={errors.email?.message}
              required
              {...register('email')}
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              leftIcon={Lock}
              error={errors.password?.message}
              required
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              {...register('password')}
            />

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 h-4 w-4 dark:border-slate-700 dark:bg-slate-900"
                  {...register('rememberMe')}
                />
                <span className="text-xs text-slate-600 dark:text-slate-400 font-medium select-none">
                  Remember me
                </span>
              </label>

              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={isSubmitting}
              rightIcon={ArrowRight}
            >
              Sign In
            </Button>
          </form>

          {/* Footer note */}
          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Don't have an account yet?{' '}
              <Link
                to="/register"
                className="font-bold text-brand-600 hover:text-brand-700 dark:text-brand-400 hover:underline"
              >
                Create account
              </Link>
            </p>
          </div>
        </div>

        {/* Credentials Reminder Card */}
        <div className="mt-4 p-3 rounded-xl bg-slate-100/80 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Default test password for all demo accounts: <code className="font-mono font-bold text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded">Demo@123</code>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

