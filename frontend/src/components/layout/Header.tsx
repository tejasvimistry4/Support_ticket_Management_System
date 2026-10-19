import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  LogOut,
  LifeBuoy,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { Badge, Button } from '../common';
import { ROUTES } from '../../routes/RouteConstants';
import { getInitials } from '../../utils/formatter';

export interface HeaderProps {
  onToggleMobileMenu: () => void;
  onOpenCreateTicketModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileMenu,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    toast.success('Successfully logged out');
    navigate(ROUTES.LOGIN);
  };

  const getPageTitle = () => {
    if (location.pathname === ROUTES.DASHBOARD) return 'Dashboard Overview';
    if (location.pathname === ROUTES.CREATE_TICKET) return 'Create Ticket';
    if (location.pathname.startsWith('/tickets/')) return 'Ticket Details';
    if (location.pathname.startsWith('/tickets')) return 'Tickets Management Queue';
    return 'SupportOps';
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="w-full flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 sm:gap-4">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 h-auto rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            aria-label="Open mobile menu"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <Link to={ROUTES.DASHBOARD} className="lg:hidden flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white shadow-xs">
              <LifeBuoy className="h-4.5 w-4.5" />
            </div>
            <span className="font-bold text-sm text-slate-900">SupportOps</span>
          </Link>

          <div className="hidden sm:block text-left">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-semibold text-slate-400">SupportOps</span>
              <span className="text-slate-300">/</span>
              <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                {getPageTitle()}
              </h1>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          {user && (
            <div
              className="flex items-center gap-3 pl-3 border-l border-slate-200"
              title={`Logged in as ${user.name} (${user.email})`}
            >

              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-slate-900 leading-tight">
                  {user.name}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  {user.role === 'ADMIN' ? 'Administrator' : 'Support Agent'}
                </span>
              </div>

              <div className="hidden md:block">
                <Badge role={user.role} size="sm" />
              </div>

              <div
                className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white font-bold text-xs ring-2 ring-slate-200 shadow-xs"
                title={`User Account Avatar: ${user.name} (${user.email})`}
                aria-label={`User Account Avatar: ${user.name}`}
              >
                <span>{getInitials(user.name)}</span>
                <span
                  className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${user.role === 'ADMIN' ? 'bg-purple-600' : 'bg-emerald-500'
                    }`}
                  title={`Role Status: ${user.role === 'ADMIN' ? 'Administrator' : 'Support Agent'}`}
                />
              </div>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            leftIcon={<LogOut className="h-3.5 w-3.5 text-slate-400 transition-colors group-hover:text-rose-600" />}
            className="hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-colors"
            title="Sign Out of SupportOps"
          >
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
