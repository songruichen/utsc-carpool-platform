import type { PropsWithChildren } from 'react';
import { CarFront } from 'lucide-react';

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2 font-semibold">
            <CarFront className="h-6 w-6 text-utsc-teal" aria-hidden="true" />
            <span>UTSC Carpool</span>
          </div>
          <nav className="flex items-center gap-4 text-sm text-slate-600">
            <a className="hover:text-slate-950" href="/">
              Find rides
            </a>
            <a className="hover:text-slate-950" href="/">
              Post ride
            </a>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}

