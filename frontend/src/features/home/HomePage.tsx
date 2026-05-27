export function HomePage() {
  return (
    <section className="grid gap-6 md:grid-cols-[1.2fr_0.8fr] md:items-center">
      <div>
        <p className="text-sm font-medium text-utsc-teal">University of Toronto Scarborough</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-slate-950">
          Share reliable rides with students heading your way.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-600">
          A student-focused carpool platform for posting trips, requesting seats, chatting with drivers, and planning routes.
        </p>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold">Phase 1 scaffold</h2>
        <p className="mt-2 text-sm text-slate-600">
          Authentication, rides, requests, chat, and Mapbox modules are ready to be built incrementally.
        </p>
      </div>
    </section>
  );
}

