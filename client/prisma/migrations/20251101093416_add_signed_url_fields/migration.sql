-- AlterTable
ALTER TABLE "property_images"
ADD COLUMN IF NOT EXISTS "signed_url" TEXT,
ADD COLUMN IF NOT EXISTS "signed_url_expires_at" TIMESTAMPTZ(6),
ALTER COLUMN "url" DROP NOT NULL;
