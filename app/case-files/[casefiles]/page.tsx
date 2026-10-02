import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticlePage } from "@/components/article-page";
import { getSupabasePublic } from "@/lib/supabase";
import { normalizeCategories } from "@/lib/utils";

type CaseFileDataRow = {
  title?: string | null;
  dek?: string | null;
  subhead?: string | null;
  summary?: string | null;
  description?: string | null;
  author?: string | null;
  author_bio?: string | null;
  modified_at?: string | null;
  created_at?: string | null;
  content?: string | null;
  category?: unknown;
};

const supabase = getSupabasePublic();

export async function generateMetadata({
  params,
}: {
  params: Promise<{ casefiles: string }>;
}): Promise<Metadata> {
  const { casefiles: uuid } = await params;
  const { data } = await supabase
    .from("casefiles")
    .select("title, dek, subhead, summary, description")
    .eq("uuid", uuid)
    .maybeSingle();
  const row = (data ?? null) as CaseFileDataRow | null;
  const title = row?.title || "Case File";
  const description =
    row?.dek ||
    row?.subhead ||
    row?.summary ||
    row?.description ||
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";

  return {
    title,
    description,
    alternates: { canonical: `/case-files/${uuid}` },
  };
}

export default async function CaseFilePage({
  params,
}: {
  params: Promise<{ casefiles: string }>;
}) {
  const { casefiles: uuid } = await params;
  try {
    const { data, error } = await supabase
      .from("casefiles")
      .select("*")
      .eq("uuid", uuid)
      .single();
    if (error || !data) notFound();
    const row = (data ?? null) as CaseFileDataRow | null;
    const title = row?.title || "Untitled";
    const dek =
      row?.dek || row?.subhead || row?.summary || row?.description || null;
    const author = row?.author || null;
    const authorBio = row?.author_bio || null;
    const publishedAt = row?.modified_at || row?.created_at || null;
    const content = row?.content || "";
    const categories = normalizeCategories(row?.category);

    return (
      <ArticlePage
        sectionLabel="Case Files"
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
