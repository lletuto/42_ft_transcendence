/*
  Warnings:

  - You are about to drop the column `FaValid` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN IF EXISTS "FaValid",
ADD COLUMN     "avatar" TEXT NOT NULL DEFAULT 'default_avatar.png',
ALTER COLUMN "nickname" DROP NOT NULL;
