export default function Loading() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-black">
      <div className="pointer-events-none cursor-none overflow-hidden fixed inset-0 z-30 w-screen h-screen flex flex-col items-center justify-center gap-4 bg-[rgba(10,10,10,0.88)] backdrop-blur">
        <div
          className="h-12 w-12 animate-spin rounded-full border-2 border-white/25 border-t-white"
          aria-hidden
        />
        <p className="text-xs uppercase tracking-[0.4em] text-white/70">Loading data...</p>
      </div>
    </div>
  )
}
