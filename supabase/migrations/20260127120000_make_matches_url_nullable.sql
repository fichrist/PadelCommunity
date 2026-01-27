-- Make the url column nullable on the matches table
-- to allow creating matches without a Playtomic URL
ALTER TABLE matches ALTER COLUMN url DROP NOT NULL;
