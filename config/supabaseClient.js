import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// ⚠️ DOIT être exécuté avant de lire process.env
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.error("❌ ERREUR : SUPABASE_URL n'est pas définie dans le fichier .env !");
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey);