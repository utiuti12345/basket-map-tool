import { createClient } from '@supabase/supabase-js'
import dotenv from "dotenv";
import path from "path";

const envFile = process.env.NODE_ENV === "production"
  ? path.resolve(__dirname, "../../.env.production")
  : process.env.NODE_ENV === "local"
    ? path.resolve(__dirname, "../../.env.local")
    : path.resolve(__dirname, "../../.env.development");
dotenv.config({ path: envFile });
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!)

export default supabase;
