import { createClient } from "@supabase/supabase-js";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticlePage } from "@/components/article-page";
import { normalizeCategories } from "@/lib/utils";

type SignalArticleDataRow = {
  title?: string | null;
  headline?: string | null;
  author?: string | null;
  byline?: string | null;
  author_bio?: string | null;
  dek?: string | null;
  subhead?: string | null;
  summary?: string | null;
  description?: string | null;
  published_at?: string | null;
  created_at?: string | null;
  content?: string | null;
  category?: unknown;
};

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const { data } = await supabase
    .from("signals")
    .select("title, headline, dek, subhead, summary, description")
    .eq("uuid", id)
    .maybeSingle();
  const row = (data ?? null) as SignalArticleDataRow | null;
  const title = row?.title || row?.headline || "Signal";
  const description =
    row?.dek ||
    row?.subhead ||
    row?.summary ||
    row?.description ||
    "A signal from Gen Uprising.";

  return {
    title,
    description,
    alternates: { canonical: `/signals/${id}` },
  };
}

export default async function SignalArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: uuid } = await params;
  try {
    const { data, error } = await supabase
      .from("signals")
      .select("*")
      .eq("uuid", uuid)
      .single();
    if (error || !data) notFound();
    const row = (data ?? null) as SignalArticleDataRow | null;
    const title = row?.title || row?.headline || row?.author || "Untitled";
    const dek =
      row?.dek || row?.subhead || row?.summary || row?.description || null;
    const author = row?.author || row?.byline || null;
    const authorBio = row?.author_bio || null;
    const publishedAt = row?.published_at || row?.created_at || null;
    const content = row?.content || "";
    const categories = normalizeCategories(row?.category);

    return (
      <ArticlePage
        sectionLabel="Signals"
        title={title}
        dek={dek}
        author={author}
        authorBio={authorBio}
        publishedAt={publishedAt}
        content={content}
        categories={categories}
      />
    );
  } catch {
    return <div className="p-8">Error loading</div>;
  }
}
