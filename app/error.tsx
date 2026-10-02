"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0a0a08] px-6 text-[#f3efe4]">
      <div className="max-w-xl text-center">
        <p className="font-mono text-xs uppercase tracking-[0.35em] text-[#ff3b30]">
          Error / template
        </p>
        <h1 className="mt-6 text-5xl font-semibold uppercase sm:text-7xl">
          Something went wrong
        </h1>
        <div className="mt-8 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-full bg-[#f3efe4] px-5 py-3 font-mono text-xs uppercase tracking-[0.25em] text-[#0a0a08]"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-full border border-[#f3efe4]/25 px-5 py-3 font-mono text-xs uppercase tracking-[0.25em] hover:border-[#f3efe4]"
          >
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}
