import type { PropsWithChildren } from 'react';
import { CarFront, LogOut, Plus, UserRound } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '@/features/auth/useAuth';

export function AppShell({ children }: PropsWithChildren) {
  const { isAuthenticated, logout, user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <Link to={isAuthenticated ? '/rides' : '/'} className="flex items-center gap-2 font-semibold">
            <CarFront className="h-6 w-6 text-utsc-teal" aria-hidden="true" />
            <span>UTSC Carpool</span>
          </Link>
          {isAuthenticated ? (
            <nav className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
              <NavItem to="/rides">Find rides</NavItem>
              <NavItem to="/rides/new">
                <Plus className="h-4 w-4" aria-hidden="true" />
                Post ride
              </NavItem>
              <NavItem to="/my-rides">My rides</NavItem>
              <div className="ml-0 flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-slate-700 sm:ml-2">
                <UserRound className="h-4 w-4" aria-hidden="true" />
                <span>{user?.firstName}</span>
              </div>
              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Sign out
              </button>
            </nav>
          ) : (
            <nav className="flex items-center gap-2 text-sm">
              <Link className="rounded-md px-3 py-2 text-slate-600 transition hover:text-slate-950" to="/login">
                Log in
              </Link>
              <Link className="rounded-md bg-utsc-teal px-3 py-2 font-medium text-white transition hover:bg-teal-700" to="/register">
                Create account
              </Link>
            </nav>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}

type NavItemProps = PropsWithChildren<{
  to: string;
}>;

function NavItem({ to, children }: NavItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `inline-flex items-center gap-2 rounded-md px-3 py-2 transition ${
          isActive ? 'bg-teal-50 font-medium text-utsc-teal' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
        }`
      }
    >
      {children}
    </NavLink>
  );
}
