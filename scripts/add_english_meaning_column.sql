-- Add english_meaning column to words table
-- This column will store English meanings/definitions for vocabulary words

ALTER TABLE words 
ADD COLUMN english_meaning TEXT NOT NULL DEFAULT 'English meaning not set';

-- Update the default constraint to ensure future inserts have a proper default
ALTER TABLE words 
ALTER COLUMN english_meaning SET DEFAULT 'English meaning not set';

-- Verify the column was added successfully
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'words' AND column_name = 'english_meaning';
