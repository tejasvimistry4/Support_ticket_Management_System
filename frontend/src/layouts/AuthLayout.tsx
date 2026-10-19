import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { LifeBuoy } from 'lucide-react';
import { ROUTES } from '../routes/RouteConstants';

export const AuthLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-white font-sans text-slate-800 antialiased">
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-slate-950 p-12 text-white lg:flex xl:p-16">

        <div className="pointer-events-none absolute -left-20 -top-20 h-80 w-80 rounded-full bg-brand-600/20 blur-3xl filter" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-indigo-600/15 blur-3xl filter" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-white shadow-md shadow-brand-600/30">
            <LifeBuoy className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-white">
              SupportOps
            </span>
            <p className="text-xs text-slate-400">
              Ticket Management System
            </p>
          </div>
        </div>

        <div className="relative z-10 my-auto max-w-lg space-y-4">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl leading-tight">
            Modern support operations, simplified.
          </h2>
          <p className="text-base text-slate-400 leading-relaxed">
            Manage tickets, collaborate with agents, and deliver fast, reliable customer support from a single workspace.
          </p>
        </div>
        <div className="relative z-10 flex items-center justify-between border-t border-slate-900 pt-6 text-xs text-slate-500">
          <span>SupportOps Platform</span>
          <span>Secure Portal</span>
        </div>
      </div>

      <div className="flex w-full flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:w-1/2 lg:px-16 xl:px-24">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <Link to={ROUTES.LOGIN} className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm">
                <LifeBuoy className="h-5 w-5" />
              </div>
              <div>
                <span className="text-lg font-bold text-slate-900">SupportOps</span>
                <p className="text-xs text-slate-500">Ticket Management System</p>
              </div>
            </Link>
          </div>

          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
