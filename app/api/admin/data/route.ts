import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const VERBOSE = process.env.ADMIN_VERBOSE === 'true' || process.env.NODE_ENV !== 'production';

function log(level: 'info' | 'warn' | 'error', message: string, meta?: any) {
    const ts = new Date().toISOString();
    if (meta !== undefined) {
        try {
            // avoid dumping very large or circular objects
            meta = typeof meta === 'string' ? meta : JSON.parse(JSON.stringify(meta));
        } catch {
            // leave meta as-is if it cannot be stringified
        }
    }
    const out = `[${ts}] [${level.toUpperCase()}] ${message}`;
    if (level === 'error') {
        console.error(out, meta ?? '');
    } else if (level === 'warn') {
        console.warn(out, meta ?? '');
    } else {
        if (VERBOSE) console.log(out, meta ?? '');
    }
}

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    log('warn', 'Supabase credentials missing', { SUPABASE_URL: !!SUPABASE_URL, SUPABASE_KEY: !!SUPABASE_SERVICE_ROLE_KEY });
}

const supabase = createClient(SUPABASE_URL || '', SUPABASE_SERVICE_ROLE_KEY || '');

async function checkAuth(req: Request) {
    try {
        const auth = req.headers.get('authorization') || '';
        const prefix = 'Bearer ';
        if (!auth) {
            log('warn', 'Authorization header missing');
            return false;
        }
        if (!auth.startsWith(prefix)) {
            log('warn', 'Authorization header present but wrong scheme', { snippet: auth.slice(0, 30) });
            return false;
        }
        const pass = auth.slice(prefix.length);
        const hash = "$2a$12$Phl7cW3wqDDLRtVvsaRuo.fxCNvfE0Hk8cK4tYPyK6ba/yL91wdge";
        if (!hash) {
            log('error', 'ADMIN_PASS not set on server');
            return false;
        }
        const ok = await bcrypt.compare(pass, hash);
        log('info', 'Auth check completed', { success: ok, passLength: pass.length });
        return ok;
    } catch (err) {
        log('error', 'Error during auth check', err instanceof Error ? { message: err.message, stack: err.stack } : err);
        return false;
    }
}

const ALLOWED = ['dod', 'casefiles', 'signals'];

export async function GET(request: Request) {
    try {
        if (!await checkAuth(request)) {
            log('warn', 'GET unauthenticated request', { url: request.url });
            return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
        }
        const url = new URL(request.url);
        const table = url.searchParams.get('table');
        if (!table || !ALLOWED.includes(table)) {
            log('warn', 'GET invalid table', { table });
            return NextResponse.json({ error: 'invalid table' }, { status: 400 });
        }

        log('info', 'GET fetching table', { table });
        const { data, error } = await supabase.from(table).select('*').order('created_at', { ascending: false });
        if (error) {
            log('error', 'Supabase GET error', { table, message: error.message, details: (error as any).details, hint: (error as any).hint, status: (error as any).status });
            return NextResponse.json({ error: error.message, details: (error as any).details || null }, { status: 500 });
        }
        log('info', 'GET succeeded', { table, rows: Array.isArray(data) ? data.length : 0 });
        return NextResponse.json({ data });
    } catch (err) {
        log('error', 'Unexpected GET error', err instanceof Error ? { message: err.message, stack: err.stack } : err);
        return NextResponse.json({ error: 'internal server error', details: err instanceof Error ? err.message : String(err) }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        if (!await checkAuth(request)) {
            log('warn', 'POST unauthenticated request', { url: request.url });
            return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
        }
        const body = await request.json();
        const { table, row } = body;
        if (!table || !row) {
            log('warn', 'POST missing table or row', { body });
            return NextResponse.json({ error: 'missing' }, { status: 400 });
        }
        if (!ALLOWED.includes(table)) {
            log('warn', 'POST invalid table', { table });
            return NextResponse.json({ error: 'invalid table' }, { status: 400 });
        }

        log('info', 'POST inserting row', { table, rowPreview: row && typeof row === 'object' ? Object.keys(row).slice(0, 5) : undefined });
        // normalize category to array of strings if possible
        const normalizeCategory = (c: any) => {
            if (c == null) return null;
            if (Array.isArray(c)) return c.map(String);
            if (typeof c === 'string') {
                const trimmed = c.trim();
                if (!trimmed) return null;
                try { const parsed = JSON.parse(trimmed); if (Array.isArray(parsed)) return parsed.map(String); } catch {}
                return trimmed.split(',').map(s => s.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
            }
            return [String(c)];
        };
        const insertRow = { ...row, created_at: row.created_at || new Date().toISOString(), modified_at: row.modified_at || null, category: normalizeCategory(row.category) };
    const { data, error } = await supabase.from(table).insert(insertRow).select();
        if (error) {
            log('error', 'Supabase POST error', { table, message: error.message, details: (error as any).details });
            return NextResponse.json({ error: error.message, details: (error as any).details || null }, { status: 500 });
        }
        log('info', 'POST succeeded', { table, inserted: Array.isArray(data) ? data.length : 1 });
        return NextResponse.json({ data });
    } catch (err) {
        log('error', 'Unexpected POST error', err instanceof Error ? { message: err.message, stack: err.stack } : err);
        return NextResponse.json({ error: 'internal server error', details: err instanceof Error ? err.message : String(err) }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        if (!await checkAuth(request)) {
            log('warn', 'PUT unauthenticated request', { url: request.url });
            return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
        }
        const body = await request.json();
        const { table, uuid, row } = body;
        if (!table || !uuid || !row) {
            log('warn', 'PUT missing table/uuid/row', { body });
            return NextResponse.json({ error: 'missing' }, { status: 400 });
        }
        if (!ALLOWED.includes(table)) {
            log('warn', 'PUT invalid table', { table });
            return NextResponse.json({ error: 'invalid table' }, { status: 400 });
        }

    log('info', 'PUT updating row', { table, uuid, rowPreview: row && typeof row === 'object' ? Object.keys(row).slice(0, 5) : undefined });
        // ensure modified_at is set to current server time whenever a row is edited
        const normalizeCategory = (c: any) => {
            if (c == null) return null;
            if (Array.isArray(c)) return c.map(String);
            if (typeof c === 'string') {
                const trimmed = c.trim();
                if (!trimmed) return null;
                try { const parsed = JSON.parse(trimmed); if (Array.isArray(parsed)) return parsed.map(String); } catch {}
                return trimmed.split(',').map(s => s.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
            }
            return [String(c)];
        };
        const updatedRow = { ...row, modified_at: new Date().toISOString(), category: normalizeCategory(row.category) };
    const { data, error } = await supabase.from(table).update(updatedRow).eq('uuid', uuid).select();
        if (error) {
            log('error', 'Supabase PUT error', { table, uuid, message: error.message, details: (error as any).details });
            return NextResponse.json({ error: error.message, details: (error as any).details || null }, { status: 500 });
        }
        log('info', 'PUT succeeded', { table, uuid, updated: Array.isArray(data) ? data.length : 1 });
        return NextResponse.json({ data });
    } catch (err) {
        log('error', 'Unexpected PUT error', err instanceof Error ? { message: err.message, stack: err.stack } : err);
        return NextResponse.json({ error: 'internal server error', details: err instanceof Error ? err.message : String(err) }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        if (!await checkAuth(request)) {
            log('warn', 'DELETE unauthenticated request', { url: request.url });
            return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
        }
        const url = new URL(request.url);
        const table = url.searchParams.get('table');
        const uuid = url.searchParams.get('uuid');
        if (!table || !uuid) {
            log('warn', 'DELETE missing table or uuid', { table, uuid });
            return NextResponse.json({ error: 'missing' }, { status: 400 });
        }
        if (!ALLOWED.includes(table)) {
            log('warn', 'DELETE invalid table', { table });
            return NextResponse.json({ error: 'invalid table' }, { status: 400 });
        }

        log('info', 'DELETE removing row', { table, uuid });
        const { data, error } = await supabase.from(table).delete().eq('uuid', uuid).select();
        if (error) {
            log('error', 'Supabase DELETE error', { table, uuid, message: error.message, details: (error as any).details });
            return NextResponse.json({ error: error.message, details: (error as any).details || null }, { status: 500 });
        }
        log('info', 'DELETE succeeded', { table, uuid, removed: Array.isArray(data) ? (data as any[]).length : 1 });
        // return fresh table after delete so client can update easily
        const { data: fresh } = await supabase.from(table).select('*').order('created_at', { ascending: false });
        return NextResponse.json({ data: fresh });
    } catch (err) {
        log('error', 'Unexpected DELETE error', err instanceof Error ? { message: err.message, stack: err.stack } : err);
        return NextResponse.json({ error: 'internal server error', details: err instanceof Error ? err.message : String(err) }, { status: 500 });
    }
}
