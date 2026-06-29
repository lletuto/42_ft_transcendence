-- CreateEnum
CREATE TYPE "MoveType" AS ENUM ('ROCK', 'PAPER', 'SCISSORS', 'WELL');

-- CreateEnum
CREATE TYPE "Bonus" AS ENUM ('ROCKS', 'PAPERS', 'SCISSORS', 'WELLS', 'BIRD', 'EDWARD');

-- CreateTable
CREATE TABLE "Game" (
    "id" SERIAL NOT NULL,
    "level" INTEGER NOT NULL,
    "playerId" INTEGER NOT NULL,
    "opponentId" INTEGER NOT NULL,
    "winnerId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "playerPoints" INTEGER NOT NULL,
    "opponentPoints" INTEGER NOT NULL,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameResult" (
    "id" SERIAL NOT NULL,
    "gameId" INTEGER NOT NULL,
    "winnerMove" "MoveType" NOT NULL,

    CONSTRAINT "GameResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WinningMove" (
    "id" SERIAL NOT NULL,
    "gameId" INTEGER NOT NULL,
    "moveType" "MoveType" NOT NULL,
    "bonusType" "Bonus",
    "points" INTEGER NOT NULL,

    CONSTRAINT "WinningMove_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GameResult_gameId_key" ON "GameResult"("gameId");

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_opponentId_fkey" FOREIGN KEY ("opponentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameResult" ADD CONSTRAINT "GameResult_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WinningMove" ADD CONSTRAINT "WinningMove_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
