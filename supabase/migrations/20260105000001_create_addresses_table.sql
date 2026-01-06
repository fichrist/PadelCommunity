-- Create addresses table for storing user location data from Google Places
CREATE TABLE IF NOT EXISTS public.addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Google Places data
    place_id VARCHAR(255),  -- For future lookups
    formatted_address TEXT,         -- Display & backup
    
    -- Parsed components (for querying/filtering)
    street_number VARCHAR(50),
    street_name VARCHAR(255),
    city VARCHAR(255),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100),
    country_code VARCHAR(2),        -- US, CA, GB, etc.
    
    -- Coordinates (for distance calculations)
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Metadata
    address_type VARCHAR(50) DEFAULT 'primary',  -- home, work, billing, shipping, primary
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON public.addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_addresses_coordinates ON public.addresses(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_addresses_city_state ON public.addresses(city, state);
CREATE INDEX IF NOT EXISTS idx_addresses_place_id ON public.addresses(place_id);

-- Enable Row Level Security
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own addresses
CREATE POLICY "Users can view their own addresses"
ON public.addresses
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own addresses
CREATE POLICY "Users can insert their own addresses"
ON public.addresses
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own addresses
CREATE POLICY "Users can update their own addresses"
ON public.addresses
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own addresses
CREATE POLICY "Users can delete their own addresses"
ON public.addresses
FOR DELETE
USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_addresses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function
CREATE TRIGGER update_addresses_updated_at
    BEFORE UPDATE ON public.addresses
    FOR EACH ROW
    EXECUTE FUNCTION public.update_addresses_updated_at();

-- Add comment to table
COMMENT ON TABLE public.addresses IS 'Stores user addresses parsed from Google Places API with coordinates for location-based features';
