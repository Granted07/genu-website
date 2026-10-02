import { Skeleton, SkeletonRegion } from "@/components/ui/skeleton";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

const KEYS = ["a", "b", "c", "d", "e", "f", "g", "h"];
const range = (count: number) => KEYS.slice(0, count);

/* ------------------------------ Listing ------------------------------ */

export function DossierCardSkeleton() {
  return (
    <div className="relative flex h-full min-h-[320px] flex-col justify-between overflow-hidden rounded-sm border border-[#f3efe4]/10 bg-[#12110d] p-7">
      <span
        aria-hidden
        className="absolute left-0 top-0 h-full w-1 bg-[#ff3b30]/40"
      />
      <div className="space-y-5">
        <Skeleton className="h-3 w-28 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-full rounded-sm" />
          <Skeleton className="h-6 w-3/4 rounded-sm" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-full rounded-full" />
          <Skeleton className="h-3 w-11/12 rounded-full" />
          <Skeleton className="h-3 w-5/6 rounded-full" />
          <Skeleton className="h-3 w-1/2 rounded-full" />
        </div>
      </div>
      <div className="mt-6 flex items-center justify-between border-t border-[#f3efe4]/10 pt-4">
        <Skeleton className="h-3 w-24 rounded-full" />
        <Skeleton className="h-3 w-4 rounded-full" />
      </div>
    </div>
  );
}

export function ListingSkeleton({
  label = "Loading articles",
}: {
  label?: string;
}) {
  return (
    <SkeletonRegion
      label={label}
      className="relative min-h-screen w-full max-w-full overflow-x-clip bg-[#0a0a08] text-[#f3efe4]"
    >
      <div className="mx-auto w-full max-w-6xl px-6 pb-24 pt-32 sm:px-10 lg:px-0">
        <div className="mb-14 grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:items-end">
          <div className="space-y-4">
            <Skeleton className="h-3 w-40 rounded-full" />
            <Skeleton className="h-14 w-4/5 rounded-sm sm:h-20" />
            <Skeleton className="h-14 w-2/3 rounded-sm sm:h-20" />
            <Skeleton className="h-5 w-56 rounded-full" />
          </div>
          <div className="hidden space-y-3 rounded-sm border border-[#f3efe4]/10 bg-[#12110d] p-5 lg:block">
            <Skeleton className="h-3 w-28 rounded-full" />
            {range(4).map((key) => (
              <Skeleton key={key} className="h-1.5 w-full rounded-full" />
            ))}
          </div>
        </div>
        <div className="mb-10 flex flex-wrap gap-2.5">
          {range(5).map((key) => (
            <Skeleton key={key} className="h-7 w-24 rounded-full" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {range(6).map((key) => (
            <DossierCardSkeleton key={key} />
          ))}
        </div>
      </div>
    </SkeletonRegion>
  );
}

/* ------------------------------ Article ------------------------------ */

const BODY_GROUPS = [
  ["w-full", "w-full", "w-11/12", "w-4/5"],
  ["w-full", "w-10/12", "w-full", "w-2/3"],
  ["w-full", "w-full", "w-3/4"],
];

export function ArticleSkeleton({
  label = "Loading article",
}: {
  label?: string;
}) {
  return (
    <SkeletonRegion
      label={label}
      tone="theme"
      className="min-h-screen bg-background"
    >
      <div className="mx-auto max-w-4xl px-6 pb-24 pt-28 sm:px-8">
        <div className="flex flex-col gap-6">
          <Skeleton className="h-3 w-36 rounded-full" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <div className="space-y-6">
            <div className="space-y-3">
              <Skeleton className="h-10 w-full rounded-md sm:h-12" />
              <Skeleton className="h-10 w-2/3 rounded-md sm:h-12" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-5 w-full rounded-full" />
              <Skeleton className="h-5 w-4/5 rounded-full" />
            </div>
            <div className="flex gap-6">
              <Skeleton className="h-4 w-32 rounded-full" />
              <Skeleton className="h-4 w-28 rounded-full" />
            </div>
          </div>
        </div>
        <div className="mt-16 space-y-10">
          {BODY_GROUPS.map((group) => (
            <div key={group.join("")} className="space-y-4">
              {group.map((width, index) => (
                <Skeleton
                  // biome-ignore lint/suspicious/noArrayIndexKey: static decorative lines
                  key={index}
                  className={cn("h-5 rounded-full", width)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </SkeletonRegion>
  );
}

/* ------------------------------- Editor ------------------------------ */

export function EditorSkeleton() {
  return (
    <SkeletonRegion
      label="Loading editor"
      className="min-h-screen bg-black text-white"
    >
      <div className="border-b border-white/10 bg-black/80">
        <div className="mx-auto flex max-w-400 items-center justify-between gap-4 px-4 py-3 lg:px-6">
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-2xl" />
            <div className="space-y-2">
              <Skeleton className="h-2.5 w-40 rounded-full" />
              <Skeleton className="h-5 w-56 rounded-md" />
            </div>
          </div>
          <div className="hidden items-center gap-2 md:flex">
            <Skeleton className="h-6 w-28 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-8 w-40 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-full" />
            <Skeleton className="h-9 w-20 rounded-full" />
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-400 px-3 py-4 lg:px-6">
        <div className="grid h-[calc(100vh-110px)] min-h-168 overflow-hidden rounded-4xl border border-white/10 bg-[#0a0a0a] lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
          <div className="flex min-h-0 flex-col lg:border-r lg:border-white/10">
            <div className="flex flex-wrap gap-2 border-b border-white/10 px-4 py-3">
              {range(6).map((key) => (
                <Skeleton key={key} className="h-8 w-20 rounded-full" />
              ))}
            </div>
            <div className="space-y-5 px-6 py-7">
              {[
                "w-3/5",
                "w-full",
                "w-11/12",
                "w-4/5",
                "w-full",
                "w-2/3",
                "w-5/6",
              ].map((width, index) => (
                <Skeleton
                  // biome-ignore lint/suspicious/noArrayIndexKey: static decorative lines
                  key={index}
                  className={cn("h-4 rounded-full", width)}
                />
              ))}
            </div>
          </div>
          <div className="hidden space-y-6 bg-white/4 px-5 py-6 lg:block">
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <Skeleton className="h-10 w-4/5 rounded-md" />
            <Skeleton className="h-4 w-40 rounded-full" />
            <div className="space-y-3 pt-4">
              {range(5).map((key) => (
                <Skeleton key={key} className="h-4 w-full rounded-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </SkeletonRegion>
  );
}

/* ---------------------------- Admin tables --------------------------- */

/** `columns` = one width class per column, e.g. ["w-40", "w-24"]. */
export function TableSkeletonRows({
  columns,
  rows = 5,
}: {
  columns: string[];
  rows?: number;
}) {
  return range(rows).map((rowKey) => (
    <TableRow
      key={rowKey}
      aria-hidden
      className="border-white/10 hover:bg-transparent"
    >
      {columns.map((width) => (
        <TableCell key={`${rowKey}-${width}`} className="align-top">
          <Skeleton className={cn("h-4 rounded-full", width)} />
        </TableCell>
      ))}
    </TableRow>
  ));
}
