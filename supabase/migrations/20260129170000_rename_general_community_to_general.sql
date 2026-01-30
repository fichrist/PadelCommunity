-- Rename "General Community" to "General"
UPDATE groups SET name = 'General' WHERE name = 'General Community' AND group_type = 'General';
