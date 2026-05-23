function getApiKey() {
  return (
    (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ||
    (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ||
    ""
  );
}

export function hasSupabaseConfig() {
  return Boolean(import.meta.env.VITE_SUPABASE_URL && getApiKey());
}

export function getSupabaseHeaders() {
  const apiKey = getApiKey();

  return {
    apikey: apiKey,
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
}

export function getSupabaseRestUrl(path: string) {
  return `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/${path}`;
}
