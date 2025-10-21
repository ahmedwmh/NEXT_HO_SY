import { createClient } from '@supabase/supabase-js'

// Get Supabase configuration from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseBucketEndpoint = process.env.SUPABASE_BUCKET_ENDPOINT

// Export bucket endpoint for file uploads
export const bucketEndpoint = supabaseBucketEndpoint

// Create Supabase client if environment variables are available
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export const supabaseAdmin = null

