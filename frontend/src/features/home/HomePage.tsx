import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/useAuth';

export function HomePage() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/rides" replace />;
  }

  return (
    <section className="grid gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-center">
      <div>
        <p className="text-sm font-medium text-utsc-teal">University of Toronto Scarborough</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
          Share reliable rides with students heading your way.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-600">
          Browse student-posted trips, request seats, and post your own drives around Scarborough with a focused campus-first experience.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link className="rounded-md bg-utsc-teal px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700" to="/register">
            Create account
          </Link>
          <Link className="rounded-md border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-white" to="/login">
            Log in
          </Link>
        </div>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="rounded-md bg-slate-950 p-4 text-white">
          <p className="text-sm text-slate-300">Next ride</p>
          <p className="mt-2 text-xl font-semibold">UTSC Student Centre to Scarborough Town Centre</p>
          <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-md bg-white/10 p-3">
              <p className="text-slate-300">Seats</p>
              <p className="mt-1 font-semibold">3 open</p>
            </div>
            <div className="rounded-md bg-white/10 p-3">
              <p className="text-slate-300">Cost</p>
              <p className="mt-1 font-semibold">$8.50</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
