// Get Supabase configuration from environment variables
const supabaseBucketEndpoint = process.env.SUPABASE_BUCKET_ENDPOINT

// Export bucket endpoint for file uploads
export const bucketEndpoint = supabaseBucketEndpoint

// Note: Supabase client functionality is disabled as the required environment variables are not available
// The project uses DATABASE_URL, DIRECT_URL, and SUPABASE_BUCKET_ENDPOINT only
export const supabase = null
export const supabaseAdmin = null

