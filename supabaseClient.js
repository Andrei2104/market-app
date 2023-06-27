import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://iugnwkmhtmaoesngepqm.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1Z253a21odG1hb2VzbmdlcHFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODI5NDYyMzYsImV4cCI6MTk5ODUyMjIzNn0._GHFr0_xC-v7qVCvyOa7ACn1huHCeHTjEHYheewZTH4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)