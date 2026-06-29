import {
  MOVES,
  BASE_MOVES,
  COUNTERS,
  RANDOM_RATE,
  WELL_RISK_THRESHOLD,
  roundResult,
} from './rpsbot/rules';

import { randomMove, argmax } from './rpsbot/utils';
import { predictDistribution } from './rpsbot/prediction';

export default class RPSBot {
  constructor(difficulty = 'medium') {
    this.setDifficulty(difficulty);
    this.level = 0;
    this.reset();
  }

  setDifficulty(difficulty) {
    this.difficulty = difficulty in RANDOM_RATE ? difficulty : 'medium';
    this.randomRate = RANDOM_RATE[this.difficulty];
  }

  setLevel(level) {
    this.level = level;
    this.moveSet = level >= 2 ? MOVES : BASE_MOVES;
  }

  updateScore(botScore, humanScore) {
    this.botScore = botScore;
    this.humanScore = humanScore;
  }

  // reset if new game or new level
  reset() {
    this.humanHistory = [];
    this.ownHistory = [];
    this.resultHistory = []; // résultat de chaque manche
    this.lastBotMove = null;
    this.botScore = 0;
    this.humanScore = 0;
    if (!this.moveSet) 
      this.setLevel(this.level);
  }

 // record the human move and update histories and scores
  recordHumanMove(move) {
    if (!MOVES.includes(move)) 
      return;
    this.humanHistory.push(move);
    if (this.lastBotMove) {
      this.ownHistory.push(this.lastBotMove);
      this.resultHistory.push(roundResult(move, this.lastBotMove));
    }
    this.lastBotMove = null;
  }

  //choose the move to play based on the prediction and the current score
  chooseMove() {
    const { randomRate, wellThreshold } = this._effectiveParams();
    const dist = predictDistribution(this.humanHistory, this.resultHistory);

    let move;
    // Play randomly when no prediction exists yet, or with probability randomRate (epsilon-greedy: keeps the bot unpredictable).
    if (!dist || Math.random() < randomRate) {
      move = randomMove(this.moveSet);
    } else {
      const predicted = argmax(dist);
      move = this._pickCounter(predicted, dist, wellThreshold);
    }
    this.lastBotMove = move;
    return move;
  }

  //choose the best counter move based on the predicted human move, the distribution, and the current score
  _pickCounter(predicted, dist, wellThreshold) {
    const all = COUNTERS[predicted].filter((c) => this.moveSet.includes(c));

    const wellRisky = this.level >= 2 && (dist.paper || 0) > wellThreshold;
    let candidates = wellRisky ? all.filter((c) => c !== 'well') : all;
    if (candidates.length === 0) 
      candidates = all;
    if (candidates.length === 1) 
      return candidates[0];
    if (this.level >= 1) {
      const streakMove = this._ownStreakMove();
      if (streakMove && candidates.includes(streakMove)) 
        return streakMove;
    }
    if (candidates.includes('well')) 
      return 'well';
    return candidates[0];
  }

  // adjust the random rate and the well threshold based on the current score difference
  _effectiveParams() {
    const delta = this.botScore - this.humanScore;
    const randomRate = delta < 0 ? this.randomRate * 0.5 : this.randomRate;
    let wellThreshold = WELL_RISK_THRESHOLD;
    if (delta < 0) 
      wellThreshold = 0.6;
    else if (delta >= 3) 
      wellThreshold = 0.25;
    return { randomRate, wellThreshold };
  }

  // check if the bot has played the same move in the last two rounds
  _ownStreakMove() {
    const n = this.ownHistory.length;
    if (n >= 2 && this.ownHistory[n - 1] === this.ownHistory[n - 2]) {
      return this.ownHistory[n - 1];
    }
    return null;
  }
}
