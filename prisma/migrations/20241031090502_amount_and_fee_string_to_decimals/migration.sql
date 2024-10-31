/*
  Warnings:

  - You are about to alter the column `amount` on the `marketing_wallets` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Decimal(22,12)`.
  - You are about to alter the column `fee` on the `marketing_wallets` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Decimal(22,12)`.

*/
-- AlterTable
ALTER TABLE `marketing_wallets` MODIFY `amount` DECIMAL(22, 12) NOT NULL,
    MODIFY `fee` DECIMAL(22, 12) NOT NULL;
