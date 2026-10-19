import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/common';
import { ROUTES } from '../../routes/RouteConstants';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-lg">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 ring-8 ring-slate-50">
          <FileQuestion className="h-8 w-8" />
        </div>

        <span className="text-xs font-bold uppercase tracking-widest text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
          HTTP 404
        </span>

        <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
          Page Not Found
        </h1>

        <p className="mt-3 text-sm text-slate-500 leading-relaxed">
          The requested route does not exist or may have been moved.
        </p>

        <div className="mt-6">
          <Link to={ROUTES.DASHBOARD}>
            <Button
              variant="primary"
              size="md"
              leftIcon={<ArrowLeft className="h-4 w-4" />}
              className="w-full"
            >
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
