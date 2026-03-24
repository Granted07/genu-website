const test = require('node:test');
const assert = require('node:assert/strict');

test('basic smoke test', () => {
  assert.equal(1 + 1, 2);
});

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const SUPABASE_TEST_TABLES = (process.env.SUPABASE_TEST_TABLES || 'dod,casefiles,signals')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

async function getOldestRow(supabase, table) {
  const sortFields = ['created_at', 'published_at', 'modified_at'];
  for (const sortField of sortFields) {
    const { data, error } = await supabase
      .from(table)
      .select('uuid,title,created_at,published_at,modified_at')
      .order(sortField, { ascending: true, nullsFirst: false })
      .limit(1);

    if (!error) {
      return {
        oldest: data?.[0] || null,
        sortedBy: sortField,
      };
    }
  }

  return {
    oldest: null,
    sortedBy: null,
  };
}

test(
  'supabase article stats by category',
  {
    skip:
      !SUPABASE_URL || !SUPABASE_KEY
        ? 'Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY) to run this test.'
        : false,
    timeout: 30000,
  },
  async () => {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    const summary = [];

    for (const table of SUPABASE_TEST_TABLES) {
      const { error: countError, count } = await supabase
        .from(table)
        .select('uuid', { count: 'exact', head: true });

      assert.equal(
        countError,
        null,
        `Count query failed for ${table}: ${countError?.message || 'unknown error'}`
      );

      const { oldest, sortedBy } = await getOldestRow(supabase, table);
      summary.push({
        table,
        count: count ?? 0,
        oldest_uuid: oldest?.uuid || null,
        oldest_title: oldest?.title || null,
        oldest_date:
          oldest?.created_at || oldest?.published_at || oldest?.modified_at || null,
        sorted_by: sortedBy,
      });
    }

    console.table(summary);
    assert.ok(summary.length > 0, 'No tables were queried. Set SUPABASE_TEST_TABLES correctly.');
  }
);

test(
  'website article rendering count',
  {
    skip: !SUPABASE_URL
      ? 'Set NEXT_PUBLIC_SUPABASE_URL to run this test.'
      : false,
    timeout: 30000,
  },
  async () => {
    const baseUrl = process.env.WEBSITE_URL || 'http://localhost:3000';
    const endpoints = [
      { path: '/api/casefiles', label: 'Case Files' },
      { path: '/api/signals', label: 'Signals' },
      { path: '/api/dod', label: 'Daughters of Dissent' },
      { path: '/api/hall-of-noise', label: 'Hall of Noise' },
    ];

    const renderingSummary = [];

    for (const { path, label } of endpoints) {
      try {
        const response = await fetch(`${baseUrl}${path}`);
        assert.ok(response.ok, `API returned ${response.status} for ${path}`);

        const json = await response.json();
        const data = json.data || [];
        const count = Array.isArray(data) ? data.length : 0;

        renderingSummary.push({
          endpoint: path,
          label,
          rendering_count: count,
        });
      } catch (err) {
        renderingSummary.push({
          endpoint: path,
          label,
          rendering_count: 0,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    console.log('\n=== Website Rendering Counts ===');
    console.table(renderingSummary);
    assert.ok(renderingSummary.length > 0, 'No endpoints were queried.');
  }
);
