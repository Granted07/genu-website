import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticlePage } from "@/components/article-page";
import { getSupabasePublic } from "@/lib/supabase";
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

const supabase = getSupabasePublic();

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
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";

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
  } catch (error) {
    if (error instanceof Error && "digest" in error) throw error;
    throw error;
  }
}
