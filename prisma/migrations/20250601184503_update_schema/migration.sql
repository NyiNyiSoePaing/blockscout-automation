-- CreateEnum
CREATE TYPE "NetworkType" AS ENUM ('mainnet', 'testnet');

-- CreateTable
CREATE TABLE "project" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rpc_servers" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "server_url" TEXT NOT NULL,
    "ip_address" TEXT NOT NULL,
    "chain_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rpc_servers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blockscout_servers" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "network_type" "NetworkType" NOT NULL,
    "server_url" TEXT NOT NULL,
    "ip_address" TEXT NOT NULL,
    "chain_id" TEXT,
    "currency" TEXT,
    "logo_url" TEXT,
    "rpc_url" TEXT,
    "network_link" TEXT,
    "footer_link" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blockscout_servers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "project_name_key" ON "project"("name");

-- AddForeignKey
ALTER TABLE "rpc_servers" ADD CONSTRAINT "rpc_servers_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blockscout_servers" ADD CONSTRAINT "blockscout_servers_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
