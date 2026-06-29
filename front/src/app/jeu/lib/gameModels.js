const MOVE_TYPE_BY_CHOICE = {
  rock: 'ROCK',
  paper: 'PAPER',
  scissors: 'SCISSORS',
  well: 'WELL',
}

export function normalizeMoveType(choice) {
  return MOVE_TYPE_BY_CHOICE[choice] ?? null
}

export function createGameModel({
  level,
  playerId = null,
  opponentId = null,
  playerLabel = 'Player',
  opponentLabel = 'Bot',
  targetScore,
}) {
  return {
    id: null,
    level,
    playerId,
    opponentId,
    winnerId: null,
    createdAt: new Date().toISOString(),
    playerPoints: 0,
    opponentPoints: 0,
    targetScore,
    playerLabel,
    opponentLabel,
    winningMoves: [],
    result: null,
  }
}

export function createWinningMoveModel({
  gameId = null,
  moveType,
  bonusType = null,
  points = 0,
  actor = 'player',
}) {
  return {
    id: null,
    gameId,
    moveType,
    bonusType,
    points,
    actor,
  }
}

export function createGameResultModel({
  gameId = null,
  winnerMove = null,
  winnerSide = null,
  playerPoints = 0,
  opponentPoints = 0,
}) {
  return {
    id: null,
    gameId,
    winnerMove,
    winnerSide,
    playerPoints,
    opponentPoints,
  }
}

