/*
  Warnings:

  - You are about to drop the `Game` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GameResult` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WinningMove` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Game" DROP CONSTRAINT "Game_opponentId_fkey";

-- DropForeignKey
ALTER TABLE "Game" DROP CONSTRAINT "Game_playerId_fkey";

-- DropForeignKey
ALTER TABLE "Game" DROP CONSTRAINT "Game_winnerId_fkey";

-- DropForeignKey
ALTER TABLE "GameResult" DROP CONSTRAINT "GameResult_gameId_fkey";

-- DropForeignKey
ALTER TABLE "WinningMove" DROP CONSTRAINT "WinningMove_gameId_fkey";

-- DropTable
DROP TABLE "Game";

-- DropTable
DROP TABLE "GameResult";

-- DropTable
DROP TABLE "WinningMove";

-- DropEnum
DROP TYPE "Bonus";

-- DropEnum
DROP TYPE "MoveType";
