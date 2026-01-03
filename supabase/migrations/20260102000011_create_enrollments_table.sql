-- Create enrollments table
CREATE TABLE IF NOT EXISTS public.enrollments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    selected_price_option TEXT NOT NULL,
    selected_add_ons JSONB DEFAULT '[]'::jsonb,
    allow_visible BOOLEAN DEFAULT true,
    enrollment_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'attended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(event_id, user_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_enrollments_event_id ON public.enrollments(event_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON public.enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON public.enrollments(status);

-- Enable RLS
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own enrollments
CREATE POLICY "Users can read their own enrollments"
    ON public.enrollments
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Event creators can read all enrollments for their events
CREATE POLICY "Event creators can read enrollments for their events"
    ON public.enrollments
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.events
            WHERE events.id = enrollments.event_id
            AND events.user_id = auth.uid()
        )
    );

-- Policy: Users can insert their own enrollments
CREATE POLICY "Users can insert their own enrollments"
    ON public.enrollments
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own enrollments
CREATE POLICY "Users can update their own enrollments"
    ON public.enrollments
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own enrollments
CREATE POLICY "Users can delete their own enrollments"
    ON public.enrollments
    FOR DELETE
    USING (auth.uid() = user_id);

-- Policy: Event creators can update enrollment status
CREATE POLICY "Event creators can update enrollment status"
    ON public.enrollments
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.events
            WHERE events.id = enrollments.event_id
            AND events.user_id = auth.uid()
        )
    );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_enrollments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_enrollments_updated_at_trigger
    BEFORE UPDATE ON public.enrollments
    FOR EACH ROW
    EXECUTE FUNCTION update_enrollments_updated_at();

-- Add comment to table
COMMENT ON TABLE public.enrollments IS 'Stores event enrollment/registration data for users';
COMMENT ON COLUMN public.enrollments.selected_price_option IS 'The pricing option selected by the user';
COMMENT ON COLUMN public.enrollments.selected_add_ons IS 'JSON array of selected add-on IDs';
COMMENT ON COLUMN public.enrollments.allow_visible IS 'Whether the user allows others to see them attending';
COMMENT ON COLUMN public.enrollments.status IS 'Enrollment status: confirmed, cancelled, or attended';
