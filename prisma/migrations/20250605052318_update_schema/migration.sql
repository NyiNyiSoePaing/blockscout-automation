-- AlterTable
ALTER TABLE "blockscout_servers" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "project" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "rpc_servers" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;
