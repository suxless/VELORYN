export function Mark({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden="true">
      <path d="M5 6 L16 26 L27 6" stroke="#EADFC4" strokeWidth="1.8" />
      <path d="M9.5 6 H22.5" stroke="#D4B46A" strokeWidth="1.4" />
      <circle cx="16" cy="26" r="1.7" fill="#D4B46A" />
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <Mark />
      <span className="font-display text-[0.8rem] font-medium uppercase tracking-[0.42em] text-vel-champagne">
        Veloryn
      </span>
    </span>
  );
}
