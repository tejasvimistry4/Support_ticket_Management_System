import React from 'react';
import { LifeBuoy } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200/90 bg-white/80 backdrop-blur-xs py-4 text-xs text-slate-500">
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center rounded-md bg-brand-50 text-brand-600">
            <LifeBuoy className="h-3.5 w-3.5" />
          </div>
          <span className="font-semibold text-slate-700">SupportOps</span>
        </div>

        <div className="text-xs text-slate-500 text-center sm:text-right">
          <span>SupportOps &copy; {new Date().getFullYear()} All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
