import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileQuestion, ArrowLeft, Home } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { ROLE_DASHBOARDS } from '../../utils/constants';
import Button from '../../components/ui/Button';

export const NotFound = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  const handleReturn = () => {
    if (isAuthenticated && user?.role) {
      navigate(ROLE_DASHBOARDS[user.role] || '/');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className="max-w-md w-full text-center space-y-6 p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft-lg">
        <div className="w-20 h-20 rounded-3xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto shadow-soft">
          <FileQuestion className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950 px-2.5 py-1 rounded-full">
            Error 404
          </span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            Page Not Found
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            The assessment, resource, or page you were looking for doesn't exist or may have been relocated.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            variant="secondary"
            size="md"
            className="w-full sm:w-auto"
            onClick={() => navigate(-1)}
            leftIcon={ArrowLeft}
          >
            Go Back
          </Button>

          <Button
            variant="primary"
            size="md"
            className="w-full sm:w-auto"
            onClick={handleReturn}
            leftIcon={Home}
          >
            {isAuthenticated ? 'My Dashboard' : 'Homepage'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

