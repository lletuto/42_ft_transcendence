/*
  Warnings:

  - You are about to drop the column `FaValid` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "FaValid",
ADD COLUMN     "refreshToken" TEXT,
ALTER COLUMN "nickname" DROP NOT NULL;
