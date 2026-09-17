-- Add product composition and ratio columns if not already present
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "componentType" TEXT DEFAULT 'STANDARD';
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "coversPerSet" INTEGER DEFAULT 1;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "framesPerSet" INTEGER DEFAULT 1;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "setRatio" INTEGER DEFAULT 1;
