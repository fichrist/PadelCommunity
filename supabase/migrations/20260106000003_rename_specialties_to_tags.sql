-- Rename specialties column to tags in healer_profiles table
ALTER TABLE healer_profiles RENAME COLUMN specialties TO tags;
