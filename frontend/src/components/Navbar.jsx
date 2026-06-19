import { Link, useLocation } from "react-router-dom";


export default function Navbar() {
  const { pathname } = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b border-[#dfe3dc]/80 bg-cream-50/85 backdrop-blur-xl">
      <nav className="mx-auto flex h-18 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link to="/" className="group flex items-center gap-3" aria-label="Extractor home">
          <span className="grid size-9 place-items-center rounded-xl bg-ink-950 text-white shadow-sm transition-transform group-hover:-rotate-3">
            <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden="true">
              <path d="M7 3.75h7l3 3V20.25H7V3.75Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
              <path d="M14 3.75v3h3M9.75 11h4.5M9.75 14.25h4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
          </span>
          <span className="text-[17px] font-bold tracking-[-0.02em] text-ink-950">Extractor</span>
        </Link>

        <div className="flex items-center gap-1 rounded-full border border-[#dfe3dc] bg-white/80 p-1 shadow-sm">
          <Link
            to="/"
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              pathname === "/"
                ? "bg-ink-950 text-white"
                : "text-ink-500 hover:bg-cream-100 hover:text-ink-950"
            }`}
          >
            Upload
          </Link>
          <Link
            to="/documents"
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              pathname.startsWith("/documents")
                ? "bg-ink-950 text-white"
                : "text-ink-500 hover:bg-cream-100 hover:text-ink-950"
            }`}
          >
            Documents
          </Link>
        </div>
      </nav>
    </header>
  );
}
