type LoadingStateProps = {
  label?: string;
};

export function LoadingState({ label = 'Loading' }: LoadingStateProps) {
  return (
    <div className="flex items-center justify-center rounded-lg border border-slate-200 bg-white px-6 py-10 text-sm text-slate-600">
      <span className="mr-3 h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-utsc-teal" />
      {label}
    </div>
  );
}
