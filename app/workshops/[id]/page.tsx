import { createClient } from "@supabase/supabase-js";
import { ArticlePage } from "@/components/article-page";
import { normalizeCategories } from "@/lib/utils";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export default async function WorkshopDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: uuid } = await params;
  try {
    let row: any = null;

    const { data, error } = await supabase
      .from("workshops")
      .select("*")
      .eq("uuid", uuid)
      .single();

    if (!error && data) {
      row = data;
    } else {
      console.error("Error fetching workshop data:", error);
    }

    if (!row) {
      return (
        <div className="min-h-screen flex items-center justify-center text-white/60 bg-black">
          Workshop not found
        </div>
      );
    }

    const title = row.title || "Untitled Workshop";
    const dek = row.summary || row.description || null;
    const author = row.location ? `Location: ${row.location}` : null;
    const publishedAt = row.created_at || null;
    const content = row.content || "";
    const categories = normalizeCategories(row.category);

    return (
      <ArticlePage
        sectionLabel="Workshops"
        title={title}
        dek={dek}
        author={author}
        publishedAt={publishedAt}
        content={content}
        categories={categories}
      />
    );
  } catch (err) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white/60 bg-black">
        Error loading workshop details
      </div>
    );
  }
}
