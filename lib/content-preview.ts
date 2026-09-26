import { getSupabasePublic } from "@/lib/supabase";
import { contentCacheKey, getOrSetJSON } from "@/lib/cache";
import { logger } from "@/lib/logger";

const QUERY_TIMEOUT_MS = 8000;
const MAX_PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE = 50;
const MAX_FALLBACK_ROWS = 500;

export type PreviewParams = { page: number; pageSize: number };

export function parsePreviewParams(url: URL): PreviewParams {
  const rawPage = Number(url.searchParams.get("page"));
  const rawSize = Number(url.searchParams.get("pageSize"));
  return {
    page: Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1,
    pageSize:
      Number.isFinite(rawSize) && rawSize > 0
        ? Math.min(Math.floor(rawSize), MAX_PAGE_SIZE)
        : DEFAULT_PAGE_SIZE,
  };
}

export async function fetchContentPreview(
  rpcName: string,
  cacheTable: string,
  { page, pageSize }: PreviewParams,
) {
  const cached = await getOrSetJSON(
    contentCacheKey(cacheTable, { page, pageSize }),
    60,
    async () => {
      const supabase = getSupabasePublic();
      const offset = (page - 1) * pageSize;
      const withOffset = await supabase
        .rpc(rpcName, { limit_count: pageSize, offset_count: offset })
        .abortSignal(AbortSignal.timeout(QUERY_TIMEOUT_MS));

      if (!withOffset.error) {
        return { data: withOffset.data, page, pageSize, paginated: true };
      }

      const message = String(withOffset.error.message || "");
      const isUnsupported =
        withOffset.error.code === "42883" ||
        withOffset.error.code === "PGRST202" ||
        /offset_count/i.test(message);
      if (!isUnsupported) throw withOffset.error;

      logger.warn("content_preview.offset_unsupported", { rpcName });
      const fallback = await supabase
        .rpc(rpcName, {
          limit_count: Math.min(page * pageSize, MAX_FALLBACK_ROWS),
        })
        .abortSignal(AbortSignal.timeout(QUERY_TIMEOUT_MS));
      if (fallback.error) throw fallback.error;

      const rows = Array.isArray(fallback.data) ? fallback.data : [];
      return {
        data: rows.slice(offset, offset + pageSize),
        page,
        pageSize,
        paginated: false,
      };
    },
  );

  return cached.value;
}
