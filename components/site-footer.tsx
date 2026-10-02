"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  ["Home", "/"],
  ["Case Files", "/case-files"],
  ["Daughters of Dissent", "/daughters-of-dissent"],
  ["Signals", "/signals"],
  ["Team", "/team"],
  ["Sponsors", "/sponsors"],
] as const;

export function SiteFooter() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="border-t border-[#f3efe4]/10 bg-[#0a0a08] px-6 py-12 text-[#f3efe4] sm:px-10 lg:px-16">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.35em] text-[#ff3b30]">
            Generation Uprising
          </p>
          <p className="mt-3 font-mono text-xs uppercase tracking-[0.25em] text-[#f3efe4]/45">
            Contact &amp; Connect via Instagram
          </p>
        </div>
        <nav
          aria-label="Footer navigation"
          className="flex flex-wrap items-center gap-x-6 gap-y-3"
        >
          {navigation.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-[#f3efe4]/60 transition hover:text-[#f3efe4]"
            >
              {label}
            </Link>
          ))}
          <a
            href="https://www.instagram.com/generationuprising/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-[#ff3b30] transition hover:text-[#f3efe4]"
          >
            Instagram / Contact
          </a>
        </nav>
      </div>
    </footer>
  );
}