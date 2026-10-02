import type * as React from "react";

import { cn } from "@/lib/utils";

type Tone = "dark" | "light" | "theme";

function Skeleton({
  className,
  tone,
  ...props
}: React.ComponentProps<"div"> & { tone?: Tone }) {
  return (
    <div
      aria-hidden
      data-slot="skeleton"
      data-skeleton-tone={tone}
      className={cn("skeleton", className)}
      {...props}
    />
  );
}

/** Announces a loading region once; children are decorative. */
function SkeletonRegion({
  label = "Loading",
  tone,
  className,
  children,
}: {
  label?: string;
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <output
      aria-live="polite"
      aria-busy="true"
      data-skeleton-tone={tone}
      className={className}
    >
      <span className="sr-only">{label}</span>
      {children}
    </output>
  );
}

export { Skeleton, SkeletonRegion };
