import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { Mail, CheckCircle2, ArrowLeft, Send } from 'lucide-react';
import toast from 'react-hot-toast';

import { forgotPasswordSchema } from '../../utils/validators';
import { authApi } from '../../api/authApi';
import { APP_CONFIG } from '../../utils/constants';

import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export const ForgotPassword = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await authApi.forgotPassword(data);
      setSubmittedEmail(data.email);
      setIsSubmitted(true);
      toast.success(response.message || 'Reset link sent!');
    } catch (err) {
      toast.error(err.message || 'Unable to process request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 via-primary-600 to-indigo-500 flex items-center justify-center text-white font-black text-2xl shadow-soft-md group-hover:scale-105 transition-transform">
            IQ
          </div>
          <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            {APP_CONFIG.NAME}
          </span>
        </Link>

        <h2 className="mt-6 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Reset your password
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          We'll send you an encrypted link to restore access
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 sm:px-10 shadow-soft-lg rounded-2xl border border-slate-200/80 dark:border-slate-800">
          {isSubmitted ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-soft">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Instructions Dispatched
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  We've sent a recovery token to{' '}
                  <span className="font-semibold text-slate-900 dark:text-slate-200">
                    {submittedEmail}
                  </span>
                  . Please check your inbox and spam folder.
                </p>
              </div>

              <div className="pt-4 space-y-3">
                <Link to="/login" className="block w-full">
                  <Button variant="primary" size="md" className="w-full">
                    Return to Sign In
                  </Button>
                </Link>

                <button
                  type="button"
                  onClick={() => setIsSubmitted(false)}
                  className="text-xs text-brand-600 hover:text-brand-700 dark:text-brand-400 font-semibold"
                >
                  Didn't receive the email? Try again
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Registered Email"
                type="email"
                placeholder="name@examiq.com"
                leftIcon={Mail}
                error={errors.email?.message}
                helperText="Enter the email associated with your ExamIQ account"
                required
                {...register('email')}
              />

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  isLoading={isSubmitting}
                  rightIcon={Send}
                >
                  Send Reset Link
                </Button>
              </div>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

