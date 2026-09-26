-- Supporting indexes for the public preview and admin listing queries.
-- Safe to run repeatedly in a hosted Supabase project.
create index if not exists dod_created_at_idx
  on public.dod (created_at desc);

create index if not exists casefiles_created_at_idx
  on public.casefiles (created_at desc);

create index if not exists signals_created_at_idx
  on public.signals (created_at desc);

create index if not exists hall_of_noise_created_at_idx
  on public.hall_of_noise (created_at desc);

-- The preview RPCs accept limit_count today. To enable true database-level
-- pagination, add offset_count integer to each function and apply OFFSET
-- offset_count in its ORDER BY query. The application currently detects older
-- signatures and uses a bounded compatibility fallback.
