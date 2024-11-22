/*
  Warnings:

  - Made the column `tx_hash` on table `marketing_wallets` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `marketing_wallets` MODIFY `tx_hash` VARCHAR(191) NOT NULL;
