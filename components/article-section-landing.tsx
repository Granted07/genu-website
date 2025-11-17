import ArticleSectionLandingClient, {
  type ArticleRecord,
  type ArticleSectionLandingClientProps,
} from "./article-section-landing.client";
import { normalizeCategories } from "@/lib/utils";

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
    const response = await fetch(apiPath, {
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
      .filter((item: ArticleRecord | null): item is ArticleRecord => Boolean(item));

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
      hrefBuilder={hrefBuilder}
      cardLabel={cardLabel}
      ctaLabel={ctaLabel}
      emptyMessage={emptyMessage}
      isLoading={false}
      errorMessage={errorMessage}
    />
  );
}
