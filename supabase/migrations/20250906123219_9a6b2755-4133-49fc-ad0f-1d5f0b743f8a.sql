-- Update lactation_status enum to include pregnant
ALTER TYPE lactation_status ADD VALUE IF NOT EXISTS 'pregnant';

-- Also ensure we have all needed values for animal_type enum
DO $$ 
BEGIN
    -- Check and add animal_type values if they don't exist
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'dairy cow' AND enumtypid = 'animal_type'::regtype) THEN
        ALTER TYPE animal_type ADD VALUE 'dairy cow';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'buffalo' AND enumtypid = 'animal_type'::regtype) THEN
        ALTER TYPE animal_type ADD VALUE 'buffalo';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'goat' AND enumtypid = 'animal_type'::regtype) THEN
        ALTER TYPE animal_type ADD VALUE 'goat';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'bull' AND enumtypid = 'animal_type'::regtype) THEN
        ALTER TYPE animal_type ADD VALUE 'bull';
    END IF;
END $$;

-- Also ensure gender enum has all needed values
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'male' AND enumtypid = 'gender'::regtype) THEN
        ALTER TYPE gender ADD VALUE 'male';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'female' AND enumtypid = 'gender'::regtype) THEN
        ALTER TYPE gender ADD VALUE 'female';
    END IF;
END $$;