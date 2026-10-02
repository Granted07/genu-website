import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0a0a08] px-6 text-[#f3efe4]">
      <div className="max-w-xl text-center">
        <p className="font-mono text-xs uppercase tracking-[0.35em] text-[#ff3b30]">
          404 / template
        </p>
        <h1 className="mt-6 text-5xl font-semibold uppercase sm:text-7xl">
          Page not found
        </h1>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-full border border-[#f3efe4]/25 px-5 py-3 font-mono text-xs uppercase tracking-[0.25em] hover:border-[#f3efe4]"
        >
          Return home
        </Link>
      </div>
    </main>
  );
}
