export default function Loading() {
  return (
    <div aria-busy="true" className="space-y-4">
      <div className="h-9 w-56 animate-pulse rounded-xl bg-white" />
      <div className="h-64 animate-pulse rounded-2xl bg-white" />
    </div>
  );
}
