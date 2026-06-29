import { MOVES } from './rules';
import { normalize } from './utils';

// frequency distribution of human moves
export function frequencyDistribution(humanHistory) {
  const counts = {};
  for (const m of humanHistory) 
    counts[m] = (counts[m] || 0) + 1;
  return normalize(counts);
}

// Markov chain of order 1: next move conditioned on the last move
export function transitionDistribution(humanHistory) {
  const last = humanHistory[humanHistory.length - 1];
  const counts = {};
  for (let i = 0; i < humanHistory.length - 1; i++) {
    if (humanHistory[i] === last) {
      const next = humanHistory[i + 1];
      counts[next] = (counts[next] || 0) + 1;
    }
  }
  return Object.keys(counts).length ? normalize(counts) : null;
}

// Win-stay / lose-shift
export function resultConditionedDistribution(humanHistory, results) {
  const last = results[results.length - 1];
  if (last === undefined) return null;
  const counts = {};
  for (let i = 1; i < humanHistory.length; i++) {
    if (results[i - 1] === last) {
      counts[humanHistory[i]] = (counts[humanHistory[i]] || 0) + 1;
    }
  }
  return Object.keys(counts).length ? normalize(counts) : null;
}

// combine two distributions : Markov and  Win-stay/lose-shift by averaging their probabilities
function blend(a, b) {
  const d = {};
  for (const m of MOVES) 
    d[m] = (a[m] + b[m]) / 2;
  return d;
}

// predict the distribution of the next human move based on the history of human moves and results. It uses both the transition distribution and the result-conditioned distribution, and blends them if both are available. If neither is available, it falls back to the frequency distribution.
export function predictDistribution(humanHistory, results = []) {
  if (humanHistory.length < 2) return null;
  const byMove = transitionDistribution(humanHistory);
  const byResult = resultConditionedDistribution(humanHistory, results);
  if (byMove && byResult)
    return blend(byMove, byResult);
  return byMove || byResult || frequencyDistribution(humanHistory);
}
