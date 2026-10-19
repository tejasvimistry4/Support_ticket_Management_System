import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Layers,
  LifeBuoy,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  X,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../common';
import { ROUTES } from '../../routes/RouteConstants';
import { getInitials } from '../../utils';

export interface SidebarProps {
  isMobileOpen: boolean;
  onMobileClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isMobileOpen,
  onMobileClose,
  isCollapsed,
  onToggleCollapse,
}) => {
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    onMobileClose();
  }, [location.pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileOpen) {
        onMobileClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileOpen, onMobileClose]);

  const navItems = [
    {
      label: 'Dashboard',
      path: ROUTES.DASHBOARD,
      icon: LayoutDashboard,
      isActive: location.pathname === ROUTES.DASHBOARD,
    },
    {
      label: 'Tickets Queue',
      path: ROUTES.TICKETS,
      icon: Layers,
      isActive:
        location.pathname.startsWith('/tickets') &&
        location.pathname !== ROUTES.CREATE_TICKET,
    },
  ];

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-white border-r border-slate-200">
      <div>
        <div
          className={`flex h-16 items-center border-b border-slate-100 px-4 transition-all ${isCollapsed ? 'justify-center' : 'justify-between'
            }`}
        >
          <Link
            to={ROUTES.DASHBOARD}
            className="flex items-center gap-3 transition-opacity hover:opacity-90"
            title="SupportOps"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white shadow-xs">
              <LifeBuoy className="h-5 w-5" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col text-left">
                <span className="text-base font-bold tracking-tight text-slate-900 leading-none">
                  SupportOps
                </span>
                <span className="text-[11px] font-medium text-slate-400 mt-1">
                  Operations Desk
                </span>
              </div>
            )}
          </Link>

          <div className={`items-center gap-1 ${isCollapsed ? 'flex lg:hidden' : 'flex'}`}>
            {!isCollapsed && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onToggleCollapse}
                className="hidden lg:inline-flex items-center justify-center rounded-lg p-1.5 h-auto text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                title="Collapse sidebar"
                aria-label="Collapse sidebar"
              >
                <PanelLeftClose className="h-4 w-4" />
              </Button>
            )}

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onMobileClose}
              className="lg:hidden rounded-lg p-1.5 h-auto text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <nav className="p-3 space-y-1.5 text-left">
          {!isCollapsed && (
            <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Navigation
            </p>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                title={isCollapsed ? item.label : undefined}
                className={`group flex items-center gap-3 rounded-xl py-2.5 text-xs font-semibold transition-all duration-150 ${item.isActive
                  ? 'bg-brand-50 text-brand-700 shadow-xs ring-1 ring-brand-500/10 font-bold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  } ${isCollapsed ? 'justify-center px-0' : 'px-3'}`}
              >
                <Icon
                  className={`h-5 w-5 shrink-0 transition-colors ${item.isActive
                    ? 'text-brand-600'
                    : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                />
                {!isCollapsed && (
                  <span className="flex-1 truncate">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="border-t border-slate-100 p-3 space-y-2">
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-2.5">
            <div
              className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white font-bold text-xs ring-2 ring-slate-200/80 shadow-xs cursor-default"
              title={`${user?.name} (${user?.role === 'ADMIN' ? 'Administrator' : 'Support Agent'})`}
            >
              <span>{getInitials(user?.name || 'User')}</span>
              <span
                className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${user?.role === 'ADMIN' ? 'bg-purple-600' : 'bg-emerald-500'
                  }`}
                title={`Role: ${user?.role === 'ADMIN' ? 'Administrator' : 'Support Agent'}`}
              />
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onToggleCollapse}
              className="hidden lg:flex h-10 w-10 p-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 shadow-2xs group"
              title="Expand sidebar"
              aria-label="Expand sidebar"
            >
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </div>
        ) : (
          <>
            <div className="px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-[11px] text-slate-600 flex flex-col gap-1 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 truncate">{user?.name}</span>
                <span className="flex items-center gap-1 text-emerald-600 font-semibold text-[10px]">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Online
                </span>
              </div>
              <div className="text-slate-500 text-[10px]">
                Role: <strong className="font-semibold text-slate-700">{user?.role === 'ADMIN' ? 'Administrator' : 'Support Agent'}</strong>
              </div>
            </div>

       
            <Button
              type="button"
              variant="unstyled"
              onClick={onToggleCollapse}
              className="hidden lg:flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 shadow-2xs transition-all active:scale-[0.99] group cursor-pointer"
              title="Collapse sidebar"
              aria-label="Collapse sidebar"
            >
              <span className="flex items-center gap-2">
                <PanelLeftClose className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                <span>Collapse Sidebar</span>
              </span>
              <ChevronLeft className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600 transition-colors group-hover:-translate-x-0.5" />
            </Button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <>
      <aside
        className={`hidden lg:block shrink-0 transition-all duration-200 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'
          }`}
      >
        <div className="sticky top-0 h-screen overflow-y-auto">
          {sidebarContent}
        </div>
      </aside>

      <div
        className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-200 ${isMobileOpen
          ? 'opacity-100 pointer-events-auto'
          : 'opacity-0 pointer-events-none'
          }`}
      >
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
          onClick={onMobileClose}
          aria-hidden="true"
        />


        <div
          className={`fixed inset-y-0 left-0 w-72 max-w-[85vw] shadow-2xl transition-transform duration-200 ease-in-out ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
        >
          {sidebarContent}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
