"use client";

import { Anton, Playfair_Display, Space_Mono } from "next/font/google";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type MouseEvent as ReactMouseEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useTransform,
} from "motion/react";
import { ArrowRight, Lock, ScanLine, ShieldAlert } from "lucide-react";

import { cn } from "@/lib/utils";
import type { ArticleSectionLandingClientProps } from "./article-section-landing.client";

/* ------------------------------------------------------------------ */
/*  Type + palette — shares the maximalist language of the homepage    */
/* ------------------------------------------------------------------ */

const anton = Anton({ subsets: ["latin"], weight: "400" });
const mono = Space_Mono({ subsets: ["latin"], weight: ["400", "700"] });
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
});

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];
const RED = "#ff3b30";
const PAPER = "#f3efe4";
const INK = "#0a0a08";

function seeded(seed: number, salt = 1) {
  const value = Math.sin(seed * salt * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}
function seededRange(seed: number, salt: number, min: number, max: number) {
  return min + seeded(seed, salt) * (max - min);
}
function padCaseNumber(index: number) {
  return String(index + 1).padStart(3, "0");
}

function stripMarkdown(input: string | null | undefined) {
  if (!input) return "";
  return input
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[([^\]]+)\]\((?:[^)]+)\)/g, "$1")
    .replace(/(^|\n)#+\s*/g, "$1")
    .replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, "$1")
    .replace(/^\s*>+\s?/gm, "")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/\n{2,}/g, "\n\n")
    .trim();
}

/* ------------------------------------------------------------------ */
/*  Interactive card — tilt + cursor spotlight, motion.dev powered     */
/* ------------------------------------------------------------------ */

function DossierCard({
  article,
  index,
  cardLabel,
  ctaLabel,
  onNavigate,
}: {
  article: ArticleSectionLandingClientProps["articles"][number];
  index: number;
  cardLabel: string;
  ctaLabel: string;
  onNavigate: (event: ReactMouseEvent<HTMLAnchorElement>, href: string) => void;
}) {
  const rotate = seededRange(index + 1, 4.1, -1.4, 1.4);
  const href = article.href ?? "#";

  const cardRef = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(50);
  const my = useMotionValue(50);
  const glow = useTransform([mx, my], (latest) => {
    const [lx, ly] = latest as number[];
    return `radial-gradient(280px circle at ${lx}% ${ly}%, rgba(255,59,48,0.16), transparent 70%)`;
  });

  const handleMove = (event: ReactMouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set(((event.clientX - rect.left) / rect.width) * 100);
    my.set(((event.clientY - rect.top) / rect.height) * 100);
  };

  const summary = stripMarkdown(article.summary);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 26, rotate }}
      animate={{ opacity: 1, y: 0, rotate }}
      exit={{ opacity: 0, y: -14, transition: { duration: 0.25 } }}
      whileHover={{ y: -8, rotate: 0, transition: { duration: 0.3, ease } }}
      transition={{ duration: 0.55, ease, delay: (index % 6) * 0.05 }}
      className="h-full"
    >
      <Link
        href={href}
        onClick={(event) => onNavigate(event, href)}
        className="group block h-full"
      >
        <div
          ref={cardRef}
          onMouseMove={handleMove}
          className="relative flex h-full min-h-[320px] flex-col justify-between overflow-hidden rounded-sm border border-[#f3efe4]/12 bg-[#12110d] p-7 shadow-[0_18px_45px_rgba(0,0,0,0.5)]"
        >
          <motion.div
            aria-hidden
            style={{ backgroundImage: glow }}
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          />

          <span
            aria-hidden
            className="pointer-events-none absolute left-0 top-0 h-full w-1"
            style={{ backgroundColor: RED }}
          />

          <span
            aria-hidden
            className="pointer-events-none absolute right-5 top-5 rotate-[8deg] rounded-sm border-2 px-2 py-0.5 font-mono text-[0.55rem] uppercase tracking-[0.25em] opacity-70"
            style={{ borderColor: RED, color: RED }}
          >
            Classified
          </span>

          <div className="relative z-10 space-y-5">
            <div className="flex items-center gap-3 font-mono text-[0.62rem] uppercase tracking-[0.35em] text-[#f3efe4]/40">
              <Lock size={11} />
              Case No. {padCaseNumber(index)}
            </div>

            <h3
              className={cn(
                anton.className,
                "text-[1.4rem] uppercase leading-[1.05] text-[#f3efe4]",
              )}
            >
              {article.title}
            </h3>

            {article.categories.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {article.categories.slice(0, 3).map((category) => (
                  <span
                    key={`${article.uuid ?? article.title}-${category}`}
                    className="rounded-full border border-[#f3efe4]/15 px-2.5 py-0.5 font-mono text-[0.58rem] uppercase tracking-[0.25em] text-[#f3efe4]/55"
                  >
                    {category}
                  </span>
                ))}
              </div>
            ) : null}

            {summary ? (
              <p
                className={cn(
                  playfair.className,
                  "line-clamp-4 text-[0.92rem] italic leading-relaxed text-[#f3efe4]/60",
                )}
              >
                {summary}
              </p>
            ) : null}
          </div>

          <div className="relative z-10 mt-6 flex items-center justify-between border-t border-[#f3efe4]/10 pt-4 font-mono text-[0.62rem] uppercase tracking-[0.35em] text-[#f3efe4]/70">
            <span className="transition-colors group-hover:text-[#ff3b30]">
              {ctaLabel}
            </span>
            <ArrowRight
              size={14}
              className="transition-transform group-hover:translate-x-1"
            />
          </div>

          <span className="pointer-events-none absolute bottom-3 left-7 font-mono text-[0.55rem] uppercase tracking-[0.3em] text-[#f3efe4]/25">
            {cardLabel}
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

function SkeletonCard({ index }: { index: number }) {
  const rotate = seededRange(index + 1, 4.1, -1.4, 1.4);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0, rotate }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="flex h-full min-h-[320px] flex-col justify-between rounded-sm border border-[#f3efe4]/10 bg-[#12110d] p-7"
    >
      <div className="space-y-4">
        <div className="h-3 w-24 rounded-full bg-[#f3efe4]/10" />
        <div className="h-6 w-4/5 rounded-full bg-[#f3efe4]/10" />
        <div className="flex gap-2">
          <div className="h-4 w-16 rounded-full bg-[#f3efe4]/10" />
          <div className="h-4 w-16 rounded-full bg-[#f3efe4]/10" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-full rounded-full bg-[#f3efe4]/[0.07]" />
          <div className="h-3 w-5/6 rounded-full bg-[#f3efe4]/[0.07]" />
          <div className="h-3 w-3/6 rounded-full bg-[#f3efe4]/[0.07]" />
        </div>
      </div>
      <div className="h-3 w-24 rounded-full bg-[#f3efe4]/10" />
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Draggable category ticker                                          */
/* ------------------------------------------------------------------ */

function CategoryRail({
  categories,
  active,
  onToggle,
  onClear,
}: {
  categories: string[];
  active: string[];
  onToggle: (category: string) => void;
  onClear: () => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  if (categories.length === 0) return null;

  return (
    <div className="w-full overflow-x-auto pb-1">
      <motion.div
        ref={trackRef}
        drag="x"
        dragConstraints={trackRef}
        dragElastic={0.1}
        className="flex w-max cursor-grab items-center gap-2.5 active:cursor-grabbing"
      >
        {categories.map((category) => {
          const isActive = active.includes(category);
          return (
            <button
              key={category}
              type="button"
              onClick={() => onToggle(category)}
              className={cn(
                "shrink-0 select-none rounded-full border px-4 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.3em] transition-colors",
                isActive
                  ? "border-[#ff3b30] bg-[#ff3b30] text-[#0a0a08]"
                  : "border-[#f3efe4]/20 text-[#f3efe4]/55 hover:border-[#f3efe4]/45 hover:text-[#f3efe4]",
              )}
            >
              {category}
            </button>
          );
        })}
        {active.length > 0 ? (
          <button
            type="button"
            onClick={onClear}
            className="shrink-0 select-none rounded-full border border-dashed border-[#f3efe4]/25 px-4 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.3em] text-[#f3efe4]/50 hover:border-[#f3efe4]/50 hover:text-[#f3efe4]"
          >
            Clear
          </button>
        ) : null}
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */

export default function CaseFilesLandingClient({
  sectionLabel,
  titleLines,
  tagline,
  articles,
  pageSize = 12,
  cardLabel = "Field Dossier",
  ctaLabel = "Open dossier",
  emptyMessage = "No matching case files",
  isLoading = false,
  errorMessage = null,
}: ArticleSectionLandingClientProps) {
  const router = useRouter();
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isNavigating, setIsNavigating] = useState(false);
  const navigationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  useEffect(() => {
    return () => {
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, []);

  const uniqueCategories = useMemo(() => {
    const set = new Set<string>();
    articles.forEach((file) => {
      file.categories.forEach((category) => set.add(category));
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [articles]);

  const filterActive = activeCategories.length > 0;

  const filteredArticles = useMemo(() => {
    if (!filterActive) return articles;
    return articles.filter((article) =>
      activeCategories.every((category) =>
        article.categories.includes(category),
      ),
    );
  }, [articles, activeCategories, filterActive]);

  const categoryTally = useMemo(() => {
    const counts = new Map<string, number>();
    articles.forEach((article) => {
      article.categories.forEach((category) => {
        counts.set(category, (counts.get(category) ?? 0) + 1);
      });
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [articles]);
  const maxTally = Math.max(1, ...categoryTally.map(([, count]) => count));

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategories.length, articles.length]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  const toggleCategory = (category: string) => {
    setActiveCategories((prev) =>
      prev.includes(category)
        ? prev.filter((item) => item !== category)
        : [...prev, category],
    );
  };

  const handleNavigate = (
    event: ReactMouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    if (!href || href === "#" || isNavigating) return;
    if (
      event.defaultPrevented ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0
    ) {
      return;
    }
    event.preventDefault();
    setIsNavigating(true);
    navigationTimeoutRef.current = setTimeout(() => {
      router.push(href);
    }, 480);
  };

  const normalizedPageSize =
    Number.isFinite(pageSize) && (pageSize ?? 0) > 0 ? (pageSize as number) : 12;
  const totalPages = Math.max(
    1,
    Math.ceil(filteredArticles.length / normalizedPageSize),
  );
  const activePage = Math.min(currentPage, totalPages);
  const pageStart = (activePage - 1) * normalizedPageSize;
  const pagedArticles = filteredArticles.slice(
    pageStart,
    pageStart + normalizedPageSize,
  );

  const hasArticles = pagedArticles.length > 0;
  const resolvedEmptyMessage = errorMessage ?? emptyMessage;
  const showPagination = totalPages > 1 && !isLoading;

  return (
    <div className={cn(mono.className, "relative min-h-screen w-full overflow-x-clip bg-[#0a0a08] text-[#f3efe4]")}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,59,48,0.1),_rgba(10,10,8,0.97)_60%)]" />

      <AnimatePresence>
        {isNavigating ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex cursor-none flex-col items-center justify-center gap-4 bg-[#0a0a08]/95 backdrop-blur"
          >
            <ScanLine className="animate-pulse text-[#ff3b30]" size={28} />
            <p className="font-mono text-[0.7rem] uppercase tracking-[0.5em] text-[#f3efe4]/70">
              Accessing dossier…
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-24 pt-32 sm:px-10 lg:px-0">
        {/* header */}
        <div className="mb-14 grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:items-end">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
          >
            <p className="mb-3 flex items-center gap-3 font-mono text-[0.65rem] uppercase tracking-[0.45em] text-[#ff3b30]">
              <ShieldAlert size={14} />
              {sectionLabel}
            </p>
            <h1 className={cn(anton.className, "text-[clamp(2.8rem,8vw,5.5rem)] uppercase leading-[0.86]")}>
              {titleLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h1>
            <p
              className={cn(
                playfair.className,
                "mt-4 text-lg italic text-[#f3efe4]/60",
              )}
            >
              {tagline}
            </p>
          </motion.div>

          {categoryTally.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease }}
              className="rounded-sm border border-[#f3efe4]/10 bg-[#12110d] p-5"
            >
              <p className="mb-3 font-mono text-[0.58rem] uppercase tracking-[0.35em] text-[#f3efe4]/40">
                Filed by category
              </p>
              <div className="space-y-2.5">
                {categoryTally.map(([category, count]) => (
                  <div key={category} className="flex items-center gap-3">
                    <span className="w-24 shrink-0 truncate font-mono text-[0.6rem] uppercase tracking-[0.2em] text-[#f3efe4]/55">
                      {category}
                    </span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#f3efe4]/10">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${(count / maxTally) * 100}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.9, ease }}
                        className="h-full rounded-full bg-[#ff3b30]"
                      />
                    </div>
                    <span className="w-6 shrink-0 text-right font-mono text-[0.6rem] text-[#f3efe4]/40">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : null}
        </div>

        {/* category filters */}
        <div className="mb-10">
          <CategoryRail
            categories={uniqueCategories}
            active={activeCategories}
            onToggle={toggleCategory}
            onClear={() => setActiveCategories([])}
          />
        </div>

        {/* grid */}
        <motion.div layout className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <SkeletonCard key={`skeleton-${index}`} index={index} />
            ))
          ) : hasArticles ? (
            <AnimatePresence mode="popLayout">
              {pagedArticles.map((article, index) => (
                <DossierCard
                  key={article.uuid ?? `${article.title}-${pageStart + index}`}
                  article={article}
                  index={pageStart + index}
                  cardLabel={cardLabel}
                  ctaLabel={ctaLabel}
                  onNavigate={handleNavigate}
                />
              ))}
            </AnimatePresence>
          ) : (
            <div className="col-span-full rounded-sm border border-dashed border-[#f3efe4]/15 py-20 text-center font-mono text-xs uppercase tracking-[0.4em] text-[#f3efe4]/45">
              {resolvedEmptyMessage}
            </div>
          )}
        </motion.div>

        {/* pagination */}
        {showPagination ? (
          <div className="mt-14 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={activePage <= 1}
              className="rounded-full border border-[#f3efe4]/20 px-5 py-2 font-mono text-[0.65rem] uppercase tracking-[0.3em] text-[#f3efe4]/70 transition hover:border-[#f3efe4]/45 hover:text-[#f3efe4] disabled:cursor-not-allowed disabled:opacity-30"
            >
              Prev
            </button>
            <span className="rounded-full border border-[#f3efe4]/10 bg-[#12110d] px-4 py-2 font-mono text-[0.65rem] uppercase tracking-[0.3em] text-[#f3efe4]/60">
              {activePage} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={activePage >= totalPages}
              className="rounded-full border border-[#f3efe4]/20 px-5 py-2 font-mono text-[0.65rem] uppercase tracking-[0.3em] text-[#f3efe4]/70 transition hover:border-[#f3efe4]/45 hover:text-[#f3efe4] disabled:cursor-not-allowed disabled:opacity-30"
            >
              Next
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
