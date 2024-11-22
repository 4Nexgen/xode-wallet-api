-- AlterTable
ALTER TABLE `marketing_wallets` CHANGE `hash` `tx_hash` VARCHAR(191),
    ADD COLUMN `block_hash` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `marketing_wallets_tx_hash_key` ON `marketing_wallets`(`tx_hash`);
