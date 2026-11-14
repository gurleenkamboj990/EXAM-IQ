import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, UserCheck, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

import { registerSchema } from '../../utils/validators';
import { authApi } from '../../api/authApi';
import { ROLES, APP_CONFIG } from '../../utils/constants';

import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';

export const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      role: ROLES.STUDENT,
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await authApi.register(data);
      toast.success(response.message || 'Registration successful! Please log in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.message || 'Failed to register account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const roleOptions = [
    { value: ROLES.STUDENT, label: 'Student / Candidate (Take Exams)' },
    { value: ROLES.TEACHER, label: 'Teacher / Instructor (Create & Evaluate)' },
  ];

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
          Create your account
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Join ExamIQ to start taking or creating assessments
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 sm:px-10 shadow-soft-lg rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="e.g. Jane Doe"
              leftIcon={User}
              error={errors.name?.message}
              required
              {...register('name')}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              leftIcon={Mail}
              error={errors.email?.message}
              required
              {...register('email')}
            />

            <Select
              label="Account Role"
              options={roleOptions}
              error={errors.role?.message}
              required
              {...register('role')}
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Minimum 6 characters"
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

            <Input
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Re-enter password"
              leftIcon={Lock}
              error={errors.confirmPassword?.message}
              required
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md transition-colors"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              {...register('confirmPassword')}
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={isSubmitting}
                rightIcon={ArrowRight}
              >
                Create Account
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-bold text-brand-600 hover:text-brand-700 dark:text-brand-400 hover:underline"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

