-- PortfolioOS Supabase Setup
-- Run this in your Supabase SQL Editor

-- 1. Create site_content table
CREATE TABLE IF NOT EXISTS public.site_content (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies

-- Policy 1: Anyone can READ (SELECT) from site_content
CREATE POLICY "Allow public read access"
ON public.site_content
FOR SELECT
TO public
USING (true);

-- Policy 2: Only authenticated users can INSERT
CREATE POLICY "Allow authenticated insert"
ON public.site_content
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy 3: Only authenticated users can UPDATE
CREATE POLICY "Allow authenticated update"
ON public.site_content
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy 4: Only authenticated users can DELETE
CREATE POLICY "Allow authenticated delete"
ON public.site_content
FOR DELETE
TO authenticated
USING (true);

-- 4. Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.site_content
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 5. Grant permissions
GRANT ALL ON public.site_content TO authenticated;
GRANT SELECT ON public.site_content TO anon;

-- Done! Your site_content table is ready.
-- You can verify by running: SELECT * FROM public.site_content;
