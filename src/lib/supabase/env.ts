/**
 * Fails fast with a clear message instead of letting `createClient`
 * reject with a confusing "supabaseUrl is required" error deep inside
 * the SDK when an env var is missing.
 *
 * `NEXT_PUBLIC_*` values only make it into the browser bundle when
 * Next.js's compiler can see a literal `process.env.NEXT_PUBLIC_X`
 * property access in the source — it statically replaces exactly that
 * expression at build time. Reading through a shared helper via
 * `process.env[name]` (computed/bracket access) defeats that analysis,
 * so each variable must be read with its own literal dot-access below,
 * even though it looks repetitive.
 */
function requireEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const supabaseUrl = (): string =>
  requireEnv('NEXT_PUBLIC_SUPABASE_URL', process.env.NEXT_PUBLIC_SUPABASE_URL);

export const supabaseAnonKey = (): string =>
  requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
