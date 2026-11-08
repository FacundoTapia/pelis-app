import { createClient } from '@supabase/supabase-js' // función que crea la conexión

// import.meta.env es cómo Vite lee las variables de .env.local
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
)