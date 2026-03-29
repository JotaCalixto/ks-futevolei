// Gerado automaticamente pelo Supabase CLI
// Execute: npm run db:types
// Por ora, usa any para não bloquear o desenvolvimento
export type Database = {
  public: {
    Tables: Record<string, { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> }>
    Functions: Record<string, unknown>
    Enums: Record<string, unknown>
  }
}
