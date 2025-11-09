export default function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-surface2 ${className}`}
      aria-busy="true"
      aria-live="polite"
    />
  );
}

