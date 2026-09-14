// Public project identifiers. Authorization is enforced by Auth and database RLS.
export const supabaseUrl=process.env.NEXT_PUBLIC_SUPABASE_URL||'https://lxhnxmgrcdohrsalvruz.supabase.co';
export const supabaseKey=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||'sb_publishable_aLu_BBOOV2_aWZNLjhrQZg_O8uHtraJ';
