-- Add policy to allow anyone to read enrollments for events they can see
CREATE POLICY "Anyone can read enrollments for visible events"
    ON public.enrollments
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.events
            WHERE events.id = enrollments.event_id
        )
    );
