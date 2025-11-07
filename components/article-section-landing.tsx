"use client";

import Link from "next/link";
import type { MouseEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, type Variants } from "framer-motion";
import { Manrope, Playfair_Display } from "next/font/google";
import { useRouter } from "next/navigation";

import { cn, normalizeCategories } from "@/lib/utils";

const easing = [0.19, 1, 0.22, 1] as [number, number, number, number];

const cardPostures = [
  { rotate: -5, x: -14, y: 6 },
  { rotate: 3, x: 6, y: -2 },
  { rotate: -2, x: -4, y: 4 },
  { rotate: 4, x: 8, y: -6 },
  { rotate: -3, x: -6, y: 2 },
  { rotate: 2, x: 4, y: -4 },
];

const tapeAngles = [-8, 5, -3, 7, -6, 4];

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: (index: number) => {
    const posture = cardPostures[index % cardPostures.length] ?? { y: 0 };
    return {
      opacity: 1,
      y: posture.y,
      transition: {
        delay: index * 0.08,
        duration: 0.65,
        ease: easing,
      },
    };
  },
};

const floatingSquares = [
  "-top-20 -left-10 h-36 w-36 rotate-[18deg] bg-white/80",
  "-top-28 right-12 h-40 w-40 rotate-[-12deg] bg-white",
  "bottom-10 -left-6 h-16 w-16 rotate-[8deg] bg-amber-400",
  "bottom-[-18%] right-[4%] h-32 w-32 rotate-[16deg] bg-white/70",
  "top-1/2 left-[5%] h-20 w-20 rotate-[32deg] bg-amber-400/80",
  "bottom-[28%] right-[11%] h-24 w-24 rotate-[-18deg] bg-white",
];

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export type ArticleRecord = {
  uuid?: string;
  title: string;
  content: string;
  categories: string[];
};

type ArticleWithIndex = {
  article: ArticleRecord;
  index: number;
};

export type ArticleSectionLandingProps = {
  apiPath: string;
  sectionLabel: string;
  titleLines: string[];
  tagline: string;
  mapRow?: (row: any) => ArticleRecord | null;
  hrefBuilder?: (record: ArticleRecord, index: number) => string;
  cardLabel?: string;
  ctaLabel?: string;
  emptyMessage?: string;
};

const defaultMapRow = (row: any): ArticleRecord | null => {
  if (!row) return null;
  return {
    uuid: row.uuid,
    title: row.title || row.author || "Untitled",
    content: row.content || "",
    categories: normalizeCategories(row.category) ?? [],
  };
};

export function ArticleSectionLanding({
  apiPath,
  sectionLabel,
  titleLines,
  tagline,
  mapRow = defaultMapRow,
  hrefBuilder,
  cardLabel = "Inside Report",
  ctaLabel = "Read dossier",
  emptyMessage = "No matching entries",
}: ArticleSectionLandingProps) {
  const [articles, setArticles] = useState<ArticleRecord[]>([]);
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const mapRef = useRef(mapRow);
  const navigationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const originalOverflowRef = useRef<{ html: string; body: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    mapRef.current = mapRow;
  }, [mapRow]);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setIsLoading(true);
        const res = await fetch(apiPath);
        if (res.ok) {
          const json = await res.json();
          const mapped: ArticleRecord[] = (json.data || [])
            .map((row: any) => mapRef.current(row))
            .filter((item: ArticleRecord | null): item is ArticleRecord =>
              Boolean(item)
            );
          if (active) {
            setArticles(mapped);
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [apiPath]);

  useEffect(() => {
    return () => {
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    if (!originalOverflowRef.current) {
      originalOverflowRef.current = {
        html: html.style.overflow,
        body: body.style.overflow,
      };
    }

    if (isNavigating) {
      html.style.overflow = "hidden";
      body.style.overflow = "hidden";
    } else {
      const original = originalOverflowRef.current;
      html.style.overflow = original?.html ?? "";
      body.style.overflow = original?.body ?? "";
    }

    return () => {
      const original = originalOverflowRef.current;
      html.style.overflow = original?.html ?? "";
      body.style.overflow = original?.body ?? "";
    };
  }, [isNavigating]);

  const shuffled = useMemo(() => {
    const copy = [...articles];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }, [articles]);

  const uniqueCategories = useMemo(() => {
    const set = new Set<string>();
    shuffled.forEach((file) => {
      file.categories.forEach((category) => set.add(category));
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [shuffled]);

  const filterActive = activeCategories.length > 0;

  const filteredArticles = useMemo(() => {
    if (!filterActive) return shuffled;

    return shuffled.filter((article) =>
      activeCategories.every((category) =>
        article.categories.includes(category)
      )
    );
  }, [shuffled, activeCategories, filterActive]);

  const toggleCategory = (category: string) => {
    setActiveCategories((prev) =>
      prev.includes(category)
        ? prev.filter((item) => item !== category)
        : [...prev, category]
    );
  };

  const clearFilters = () => {
    setActiveCategories([]);
  };

  const heroMotionProps = {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: easing },
  };

  const HeroSection = ({ className }: { className?: string }) => (
    <motion.div
      {...heroMotionProps}
      className={cn(
        manrope.className,
        "flex w-full max-w-md flex-col items-center gap-6 text-center text-white",
        className
      )}
    >
      <div className="space-y-3">
        <p className="text-[0.6rem] uppercase tracking-[0.65em] text-white/45">
          {sectionLabel}
        </p>
        <h1
          className={cn(
            playfair.className,
            "text-balance text-[clamp(2.5rem,7vw,4rem)] font-semibold uppercase leading-[0.9]"
          )}
        >
          {titleLines.map((line, index) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h1>
        <p className="text-xs font-medium uppercase tracking-[0.45em] text-white/55 sm:text-sm">
          {tagline}
        </p>
      </div>

      {uniqueCategories.length > 0 ? (
        <div className="flex w-full flex-wrap justify-center gap-2">
          {uniqueCategories.map((category) => {
            const isActive = activeCategories.includes(category);
            return (
              <button
                key={category}
                type="button"
                onClick={() => toggleCategory(category)}
                className={cn(
                  "rounded-full hover:cursor-pointer border px-4 py-1 text-[0.62rem] uppercase tracking-[0.35em] transition",
                  isActive
                    ? "border-white bg-white/20 text-white"
                    : "border-white/25 text-white/60 hover:border-white/45 hover:text-white"
                )}
              >
                {category}
              </button>
            );
          })}
        </div>
      ) : null}

      {filterActive ? (
        <button
          type="button"
          onClick={clearFilters}
          className="text-[0.6rem] hover:cursor-pointer uppercase tracking-[0.35em] text-white/60 underline"
        >
          Reset filters
        </button>
      ) : null}
    </motion.div>
  );

  const handleNavigate = (
    event: MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    if (!href || isNavigating) return;
    if (event.defaultPrevented) return;
    if (
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
    }, 520);
  };

  const ArticleCard = ({
    article,
    index,
    className,
  }: {
    article: ArticleRecord;
    index: number;
    className?: string;
  }) => {
    const posture = cardPostures[index % cardPostures.length];
    const tapeAngle = tapeAngles[index % tapeAngles.length];
    const href = hrefBuilder ? hrefBuilder(article, index) : `#`;

    return (
      <motion.div
        variants={cardVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        custom={index}
        className={cn(manrope.className, "h-full", className)}
        style={{ rotate: posture.rotate, x: posture.x }}
      >
        <Link
          href={href}
          className="group block h-full"
          onClick={(event) => handleNavigate(event, href)}
        >
          <div className="relative flex h-full min-h-[300px] flex-col justify-between overflow-hidden rounded-[1.35rem] border border-black/10 bg-[#f5efe3] p-7 shadow-[0_14px_36px_rgba(0,0,0,0.28)] transition-transform duration-500 ease-out group-hover:-translate-y-2">
            <div
              className="pointer-events-none absolute -top-7 left-1/2 h-8 w-24 -translate-x-1/2 rounded-sm bg-[rgba(250,229,158,0.9)] shadow-[0_6px_14px_rgba(0,0,0,0.25)]"
              style={{ transform: `rotate(${tapeAngle}deg)` }}
              aria-hidden
            />

            <div
              className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(118deg,transparent_0,transparent_12px,rgba(0,0,0,0.025)_12px,rgba(0,0,0,0.025)_13px)]"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-4 rounded-[0.95rem] border border-black/8"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute bottom-0 left-0 right-0 h-6 bg-[radial-gradient(circle_at_top,rgba(0,0,0,0.1),transparent_70%)] opacity-70"
              aria-hidden
            />

            <div className="relative z-10 space-y-6 text-left text-neutral-900">
              <div className="space-y-3">
                <p className="text-[0.68rem] uppercase tracking-[0.45em] text-neutral-500">
                  {cardLabel}
                </p>
                <h3
                  className={cn(
                    playfair.className,
                    "text-[1.35rem] font-semibold leading-snug text-neutral-900"
                  )}
                >
                  {article.title}
                </h3>
                {article.categories.length > 0 ? (
                  <div className="flex flex-wrap gap-2 text-[0.65rem] uppercase tracking-[0.3em] text-neutral-500">
                    {article.categories.slice(0, 3).map((category) => (
                      <span
                        key={`${article.uuid}-${category}`}
                        className="rounded bg-neutral-200/80 px-2 py-0.5 text-neutral-600"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>

              <p
                className={cn(
                  playfair.className,
                  "line-clamp-5 text-[0.88rem] leading-relaxed text-neutral-700"
                )}
              >
                {article.content
                  ? article.content
                      .replace(/```[\s\S]*?```/g, "") // remove code fences
                      .replace(/`([^`]+)`/g, "$1") // inline code
                      .replace(/!\[.*?\]\(.*?\)/g, "") // images
                      .replace(/\[([^\]]+)\]\((?:[^)]+)\)/g, "$1") // links -> text
                      .replace(/(^|\n)#+\s*/g, "$1") // headings
                      .replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, "$1") // emphasis/bold/italic
                      .replace(/^\s*>+\s?/gm, "") // blockquotes
                      .replace(/^\s*[-*+]\s+/gm, "") // list markers
                      .replace(/\n{2,}/g, "\n\n")
                      .trim()
                  : null}
              </p>
            </div>

            <div className="relative z-10 flex items-center justify-between pt-5 text-[0.65rem] uppercase tracking-[0.35em] text-neutral-500">
              <span>{ctaLabel}</span>
              <span>→</span>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  };

  const SkeletonCard = ({
    index,
    className,
  }: {
    index: number;
    className?: string;
  }) => {
    const posture = cardPostures[index % cardPostures.length];
    const tapeAngle = tapeAngles[index % tapeAngles.length];

    return (
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        custom={index}
        className={cn(manrope.className, "h-full", className)}
        style={{ rotate: posture.rotate, x: posture.x }}
      >
        <div className="relative flex h-full min-h-[300px] flex-col justify-between overflow-hidden rounded-[1.35rem] border border-black/10 bg-[#f5efe3] p-7 opacity-70">
          <div
            className="pointer-events-none absolute -top-7 left-1/2 h-8 w-24 -translate-x-1/2 rounded-sm bg-[rgba(250,229,158,0.6)]"
            style={{ transform: `rotate(${tapeAngle}deg)` }}
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(118deg,transparent_0,transparent_12px,rgba(0,0,0,0.015)_12px,rgba(0,0,0,0.015)_13px)]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-4 rounded-[0.95rem] border border-black/8"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute bottom-0 left-0 right-0 h-6 bg-[radial-gradient(circle_at_top,rgba(0,0,0,0.08),transparent_70%)] opacity-70"
            aria-hidden
          />

          <div className="relative z-10 space-y-6">
            <div className="space-y-3">
              <div className="h-3 w-24 rounded-full bg-neutral-300/70 animate-pulse" />
              <div className="h-6 w-40 rounded-full bg-neutral-300/70 animate-pulse" />
              <div className="flex gap-2">
                <span className="h-3 w-16 rounded-full bg-neutral-300/60 animate-pulse" />
                <span className="h-3 w-16 rounded-full bg-neutral-300/60 animate-pulse" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="h-3 w-full rounded-full bg-neutral-300/50 animate-pulse" />
              <div className="h-3 w-5/6 rounded-full bg-neutral-300/50 animate-pulse" />
              <div className="h-3 w-4/6 rounded-full bg-neutral-300/50 animate-pulse" />
              <div className="h-3 w-3/6 rounded-full bg-neutral-300/50 animate-pulse" />
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-between pt-5 text-[0.65rem] uppercase tracking-[0.35em] text-neutral-400">
            <span className="h-3 w-20 rounded-full bg-neutral-300/50 animate-pulse" />
            <span className="h-3 w-6 rounded-full bg-neutral-300/50 animate-pulse" />
          </div>
        </div>
      </motion.div>
    );
  };

  const articlesSource = filterActive ? filteredArticles : shuffled;
  const articlesWithIndex = useMemo<ArticleWithIndex[]>(
    () => articlesSource.map((article, index) => ({ article, index })),
    [articlesSource]
  );

  const heroLeft = articlesWithIndex[0];
  const heroRight = articlesWithIndex[1];
  const remainingArticles = articlesWithIndex.slice(2);

  const remainderGroups: ArticleWithIndex[][] = [];
  for (let i = 0; i < remainingArticles.length; i += 3) {
    remainderGroups.push(remainingArticles.slice(i, i + 3));
  }

  const hasArticles = articlesWithIndex.length > 0;
  const mobileHasItems = !isLoading && hasArticles;
  const skeletonIndices = [0, 1, 2, 3, 4, 5];

  return (
    <div
      className={cn(
        manrope.className,
        "relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),_rgba(0,0,0,0.92)_55%)]"
      )}
    >
      {isNavigating ? (
        <div className="pointer-events-none cursor-none overflow-hidden absolute inset-0 z-30 w-screen h-screen flex flex-col items-center justify-center gap-4 bg-[rgba(10,10,10,0.88)] backdrop-blur">
          <div
            className="h-12 w-12 animate-spin rounded-full border-2 border-white/25 border-t-white"
            aria-hidden
          />
          <p className="text-[0.7rem] uppercase tracking-[0.5em] text-white/70">
            Preparing dossier…
          </p>
        </div>
      ) : null}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(15,15,15,0.6),rgba(15,15,15,0.95))]" />

      {floatingSquares.map((classes, index) => (
        <div
          key={index}
          aria-hidden
          className={`pointer-events-none absolute z-0 rounded-[18%] bg-blend-screen blur-[0.2px] ${classes}`}
        />
      ))}

      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-24 pt-28 sm:px-10">
        <div className="hidden w-full gap-14 lg:flex lg:flex-col">
          {isLoading ? (
            <>
              <div className="grid grid-cols-3 gap-10">
                <SkeletonCard index={0} />
                <HeroSection className="h-full w-full justify-center" />
                <SkeletonCard index={1} />
              </div>

              <div className="grid grid-cols-3 gap-10">
                {skeletonIndices.slice(2, 5).map((idx) => (
                  <SkeletonCard key={`skeleton-${idx}`} index={idx} />
                ))}
              </div>

              <div className="grid grid-cols-3 items-start gap-10">
                <div />
                <div className="flex justify-center">
                  <SkeletonCard index={5} className="w-full max-w-sm" />
                </div>
                <div />
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-10">
                {heroLeft ? (
                  <ArticleCard
                    article={heroLeft.article}
                    index={heroLeft.index}
                  />
                ) : (
                  <div />
                )}
                <HeroSection className="h-full w-full justify-center" />
                {heroRight ? (
                  <ArticleCard
                    article={heroRight.article}
                    index={heroRight.index}
                  />
                ) : (
                  <div />
                )}
              </div>

              {hasArticles ? (
                remainderGroups.length > 0 ? (
                  remainderGroups.map((group, groupIndex) =>
                    group.length === 3 ? (
                      <div className="grid grid-cols-3 gap-10" key={`group-${groupIndex}`}>
                        {group.map(({ article, index }) => (
                          <ArticleCard
                            key={article.uuid ?? `${article.title}-${index}`}
                            article={article}
                            index={index}
                          />
                        ))}
                      </div>
                    ) : (
                      <div
                        className="flex flex-wrap justify-center gap-10"
                        key={`group-${groupIndex}`}
                      >
                        {group.map(({ article, index }) => (
                          <ArticleCard
                            key={article.uuid ?? `${article.title}-${index}`}
                            article={article}
                            index={index}
                            className="w-full max-w-sm"
                          />
                        ))}
                      </div>
                    )
                  )
                ) : null
              ) : (
                <div className="rounded-xl border border-dashed border-white/20 bg-white/5 py-16 text-center text-sm uppercase tracking-[0.4em] text-white/60">
                  {emptyMessage}
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex flex-col gap-12 lg:hidden">
          <HeroSection />
          {isLoading ? (
            skeletonIndices.map((idx) => (
              <SkeletonCard key={`mobile-skeleton-${idx}`} index={idx} />
            ))
          ) : mobileHasItems ? (
            articlesWithIndex.map(({ article, index }) => (
              <ArticleCard
                key={article.uuid ?? `${article.title}-${index}`}
                article={article}
                index={index}
              />
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-white/20 bg-white/5 py-10 text-center text-xs uppercase tracking-[0.35em] text-white/60">
              {emptyMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
