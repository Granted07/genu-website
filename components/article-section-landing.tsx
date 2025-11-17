import ArticleSectionLandingClient, {
  type ArticleRecord,
  type ArticleSectionLandingClientProps,
} from "./article-section-landing.client";
import { headers as getRequestHeaders } from "next/headers";

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
const resolveApiUrlWithHeaders = (
  apiPath: string,
  incoming: Headers
): string => {
  try {
    return new URL(apiPath).toString();
  } catch {
    const forwardedProto = incoming.get("x-forwarded-proto");
    const forwardedHost =
      incoming.get("x-forwarded-host") ?? incoming.get("host");

    if (forwardedHost) {
      const protocol = forwardedProto ?? (forwardedHost.includes("localhost") ? "http" : "https");
      const base = `${protocol}://${forwardedHost}`;
      const rootedPath = apiPath.startsWith("/") ? apiPath : `/${apiPath}`;
      try {
        return new URL(rootedPath, base).toString();
      } catch {
        // fall through to default origin
      }
    }

    return resolveApiUrl(apiPath);
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

  const incomingHeadersList = await getRequestHeaders();
  const incomingHeaders = new Headers();
  incomingHeadersList.forEach((value: string, key: string) => {
    incomingHeaders.append(key, value);
  });
  const outgoingHeaders = new Headers(
    fetchOptions?.headers as HeadersInit | undefined
  );
  if (!outgoingHeaders.has("accept")) {
    outgoingHeaders.set("accept", "application/json");
  }
  const cookieHeader = incomingHeaders.get("cookie");
  if (cookieHeader && !outgoingHeaders.has("cookie")) {
    outgoingHeaders.set("cookie", cookieHeader);
  }
  const authorizationHeader = incomingHeaders.get("authorization");
  if (authorizationHeader && !outgoingHeaders.has("authorization")) {
    outgoingHeaders.set("authorization", authorizationHeader);
  }
  const vercelBypass = incomingHeaders.get("x-vercel-protection-bypass");
  if (vercelBypass && !outgoingHeaders.has("x-vercel-protection-bypass")) {
    outgoingHeaders.set("x-vercel-protection-bypass", vercelBypass);
  }

  const nextOptions = {
    ...fetchOptions?.next,
    revalidate: fetchOptions?.next?.revalidate ?? revalidate,
  };

  try {
    const response = await fetch(
      resolveApiUrlWithHeaders(apiPath, incomingHeaders),
      {
      ...fetchOptions,
        headers: outgoingHeaders,
      cache: fetchOptions?.cache ?? "force-cache",
      next: nextOptions,
      }
    );

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
