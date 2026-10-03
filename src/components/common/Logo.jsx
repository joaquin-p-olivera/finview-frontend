// Finview's mark (a magnifying glass over a rising line) next to the name.
// The same drawing is public/favicon.svg.
function Logo() {
  return (
    <span className="flex items-center gap-2">
      <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true" className="shrink-0">
        <rect width="32" height="32" rx="8" fill="#1e1b4b" />
        <circle cx="14" cy="14" r="8.5" fill="none" stroke="#818cf8" strokeWidth="2.6" />
        <path d="M20.2 20.2 26 26" stroke="#818cf8" strokeWidth="3" strokeLinecap="round" />
        <path
          d="M9.5 17 12.5 13.5 15 15.5 18.5 10.5"
          fill="none"
          stroke="#34d399"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="text-lg font-bold tracking-tight text-slate-50">
        Fin<span className="text-indigo-400">view</span>
      </span>
    </span>
  );
}

export default Logo;
