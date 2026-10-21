/**
 * Centralized Supabase Client Configuration
 * Project ID: iqnhcovwjwjelinlhkmj
 * Project URL: https://iqnhcovwjwjelinlhkmj.supabase.co
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const SUPABASE_PROJECT_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://iqnhcovwjwjelinlhkmj.supabase.co';

// Official Supabase public anon key supplied for project iqnhcovwjwjelinlhkmj
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlxbmhjb3Z3andqZWxpbmxoa21qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI0OTE5MjMsImV4cCI6MjEwODA2NzkyM30.uJGQRPj1vWTlxOKEI9EmcJFHbiGOwrqNwbRlmSrnnWk';

export const getActiveSupabaseKey = (): string => {
  const envKey =
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (envKey && typeof envKey === 'string' && envKey.trim() && !envKey.includes('placeholder') && envKey.length > 20) {
    return envKey.trim();
  }
  if (typeof window !== 'undefined') {
    const runtimeKey = localStorage.getItem('dem_supabase_publishable_key');
    if (runtimeKey && runtimeKey.trim() && !runtimeKey.includes('placeholder') && runtimeKey.length > 20) {
      return runtimeKey.trim();
    }
  }
  return DEFAULT_SUPABASE_ANON_KEY;
};

let currentKey = getActiveSupabaseKey();

export let supabase: SupabaseClient = createClient(
  SUPABASE_PROJECT_URL,
  currentKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

export const setRuntimeSupabaseKey = (key: string) => {
  const cleanKey = key.trim() || DEFAULT_SUPABASE_ANON_KEY;
  if (typeof window !== 'undefined') {
    if (key.trim()) {
      localStorage.setItem('dem_supabase_publishable_key', key.trim());
    } else {
      localStorage.removeItem('dem_supabase_publishable_key');
    }
  }
  currentKey = cleanKey;
  supabase = createClient(
    SUPABASE_PROJECT_URL,
    cleanKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    }
  );
};

export const isSupabaseConfigured = (): boolean => {
  const key = getActiveSupabaseKey();
  return Boolean(
    key &&
    key !== 'sb_publishable_placeholder_configure_in_env_or_settings' &&
    key.length > 20
  );
};

export interface ConnectionStatus {
  ok: boolean;
  message: string;
  latencyMs?: number;
  statusCode?: number;
  error?: string;
  checkedAt: string;
}

export const testSupabaseConnection = async (): Promise<ConnectionStatus> => {
  const checkedAt = new Date().toISOString();

  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      message: 'Supabase Publishable/Anon Key not yet configured.',
      checkedAt,
    };
  }

  const startTime = performance.now();
  try {
    const { data, error, status } = await supabase
      .from('categories')
      .select('count', { count: 'exact', head: true });

    const latencyMs = Math.round(performance.now() - startTime);

    if (error) {
      if (error.code === '42P01' || error.message?.includes('relation "public.categories" does not exist')) {
        return {
          ok: true,
          statusCode: status,
          latencyMs,
          message: 'Connected to Supabase! (Database tables awaiting migration execution)',
          checkedAt,
        };
      }
      return {
        ok: false,
        statusCode: status,
        latencyMs,
        message: `Database error: ${error.message}`,
        error: error.message,
        checkedAt,
      };
    }

    return {
      ok: true,
      statusCode: status,
      latencyMs,
      message: 'Successfully connected to Supabase PostgreSQL & Auth API!',
      checkedAt,
    };
  } catch (err: any) {
    const latencyMs = Math.round(performance.now() - startTime);
    return {
      ok: false,
      latencyMs,
      message: err?.message || 'Network error connecting to Supabase URL',
      error: String(err),
      checkedAt,
    };
  }
};
