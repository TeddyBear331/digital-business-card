import { createClient } from "@supabase/supabase-js"

// 確保環境變數已設定
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.")
}

// 建立 Supabase 客戶端實例
// 在客戶端環境中，模組導入本身就具有快取機制，因此不需要額外的全局物件檢查
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export { supabase }
