import { createClient } from "@supabase/supabase-js";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticlePage } from "@/components/article-page";
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

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

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
    "An investigation from Gen Uprising.";

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
  } catch {
    return <div className="p-8">Error loading</div>;
  }
}
