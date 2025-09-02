-- AddColumn
ALTER TABLE "properties" ADD COLUMN "deleted_at" TIMESTAMPTZ(6);

-- AddColumn  
ALTER TABLE "transactions" ADD COLUMN "deleted_at" TIMESTAMPTZ(6);

-- CreateIndex
CREATE INDEX "properties_deleted_at_idx" ON "properties"("deleted_at");

-- CreateIndex
CREATE INDEX "transactions_deleted_at_idx" ON "transactions"("deleted_at");