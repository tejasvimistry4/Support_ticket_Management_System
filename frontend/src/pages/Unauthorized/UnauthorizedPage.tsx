import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LifeBuoy } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Badge, Button } from '../../components/common';
import { ROUTES } from '../../routes/RouteConstants';

export const UnauthorizedPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-lg">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 ring-8 ring-rose-50/50">
          <ShieldAlert className="h-8 w-8" />
        </div>

        <Badge className="text-xs font-bold uppercase tracking-widest text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200/60">
          HTTP 403 Forbidden
        </Badge>

        <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
          Access Denied
        </h1>

        <p className="mt-3 text-sm text-slate-500 leading-relaxed">
          Your current account does not have sufficient permissions to view this resource. 
          This area is restricted to higher administrative privileges.
        </p>

        {user && (
          <div className="my-5 rounded-xl border border-slate-100 bg-slate-50 p-3 flex items-center justify-between text-xs">
            <span className="text-slate-500">Current Role:</span>
            <Badge role={user.role} />
          </div>
        )}

        <div className="mt-6 flex flex-col gap-2">
          <Link to={ROUTES.DASHBOARD}>
            <Button
              variant="primary"
              size="md"
              leftIcon={<ArrowLeft className="h-4 w-4" />}
              className="w-full"
            >
              Return to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
