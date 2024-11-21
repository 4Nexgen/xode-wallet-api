/*
  Warnings:

  - Added the required column `email_address` to the `marketing_wallets` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `marketing_wallets` ADD COLUMN `email_address` VARCHAR(191) NOT NULL;
