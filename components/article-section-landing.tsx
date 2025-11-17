import ArticleSectionLandingClient, {
  type ArticleRecord,
  type ArticleSectionLandingClientProps,
} from "./article-section-landing.client";
import { normalizeCategories } from "@/lib/utils";

const SUMMARY_MAX_LENGTH = 1200;

const normalizeBaseUrl = (value?: string | null): string | null => {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  const candidate = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    return new URL(candidate).origin;
  } catch {
    return null;
  }
};

const getDefaultOrigin = (): string => {
  const envCandidates = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.SITE_URL,
    process.env.NEXTAUTH_URL,
  ];

  for (const candidate of envCandidates) {
    const normalized = normalizeBaseUrl(candidate);
    if (normalized) {
      return normalized;
    }
  }

  const vercelNormalized = normalizeBaseUrl(process.env.VERCEL_URL);
  if (vercelNormalized) {
    return vercelNormalized;
  }

  const port = process.env.PORT ?? "3000";
  return `http://localhost:${port}`;
};

const resolveApiUrl = (apiPath: string): string => {
  try {
    return new URL(apiPath).toString();
  } catch {
    return new URL(apiPath, getDefaultOrigin()).toString();
  }
};

const truncateSummary = (summary: string | null | undefined): string => {
  if (typeof summary !== "string" || summary.length === 0) return "";
  if (summary.length <= SUMMARY_MAX_LENGTH) return summary;

  const truncated = summary.slice(0, SUMMARY_MAX_LENGTH).trimEnd();
  if (/([.!?]|\.\.\.)$/.test(truncated)) {
    return truncated;
  }
  return `${truncated}...`;
};

type ExtendedRequestInit = RequestInit & {
  next?: {
    revalidate?: number;
    tags?: string[];
  };
};

export type ArticleSectionLandingProps = Omit<
  ArticleSectionLandingClientProps,
  "articles" | "isLoading" | "errorMessage"
> & {
  apiPath: string;
  hrefBuilder?: (record: ArticleRecord, index: number) => string;
  mapRow?: (row: any) => ArticleRecord | null;
  revalidate?: number;
  fetchOptions?: ExtendedRequestInit;
  fallbackErrorMessage?: string;
};

const defaultMapRow = (row: any): ArticleRecord | null => {
  if (!row) return null;
  return {
    uuid: row.uuid,
    title: row.title || row.author || "Untitled",
    summary: row.summary || "",
    categories: normalizeCategories(row.category) ?? [],
  };
};

export type { ArticleRecord };

export default async function ArticleSectionLanding({
  apiPath,
  sectionLabel,
  titleLines,
  tagline,
  hrefBuilder,
  cardLabel = "Inside Report",
  ctaLabel = "Read dossier",
  emptyMessage = "No matching entries",
  mapRow = defaultMapRow,
  revalidate = 300,
  fetchOptions,
  fallbackErrorMessage,
}: ArticleSectionLandingProps) {
  let articles: ArticleRecord[] = [];
  let errorMessage: string | null = null;

  const headers = new Headers(fetchOptions?.headers as HeadersInit | undefined);
  if (!headers.has("accept")) {
    headers.set("accept", "application/json");
  }

  const nextOptions = {
    ...fetchOptions?.next,
    revalidate: fetchOptions?.next?.revalidate ?? revalidate,
  };

  try {
    const response = await fetch(resolveApiUrl(apiPath), {
      ...fetchOptions,
      headers,
      cache: fetchOptions?.cache ?? "force-cache",
      next: nextOptions,
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    const payload = await response.json();
    const rows = Array.isArray(payload?.data) ? payload.data : [];
    articles = rows
      .map((row: any) => mapRow(row))
        .filter((item: ArticleRecord | null): item is ArticleRecord => Boolean(item))
        .map((item: ArticleRecord, index: number) => ({
          ...item,
          summary: truncateSummary(item.summary),
          href: hrefBuilder ? hrefBuilder(item, index) : item.href,
        }));

    if (articles.length === 0) {
      errorMessage = fallbackErrorMessage ?? null;
    }
  } catch (error) {
    console.error("ArticleSectionLanding fetch error", error);
    errorMessage =
      fallbackErrorMessage ?? "Unable to load case files. Please try again shortly.";
    articles = [];
  }

  return (
    <ArticleSectionLandingClient
      sectionLabel={sectionLabel}
      titleLines={titleLines}
      tagline={tagline}
      articles={articles}
      cardLabel={cardLabel}
      ctaLabel={ctaLabel}
      emptyMessage={emptyMessage}
      isLoading={false}
      errorMessage={errorMessage}
    />
  );
}
