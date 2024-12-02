// lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://zrvvskxywtblqkbxlpjr.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpydnZza3h5d3RibHFrYnhscGpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMxNjEwNzIsImV4cCI6MjA0ODczNzA3Mn0.oDmniyOY0I2Z4ax2v2egSR2qcFmQNovSXpOP4YgfqsI"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)