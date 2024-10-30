-- CreateTable
CREATE TABLE `marketing_wallets` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `wallet_address` VARCHAR(191) NOT NULL,
    `amount` VARCHAR(191) NOT NULL,
    `fee` VARCHAR(191) NOT NULL,
    `hash` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
