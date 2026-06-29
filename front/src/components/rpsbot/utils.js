import { MOVES } from './rules';

export function randomMove(moveSet) {
  return moveSet[Math.floor(Math.random() * moveSet.length)];
}

// move count into { move: proba }.
export function normalize(counts) {
  const total = Object.values(counts).reduce((s, n) => s + n, 0) || 1;
  const dist = {};
  for (const m of MOVES) 
    dist[m] = (counts[m] || 0) / total;
  return dist;
}

export function argmax(dist) {
  return Object.keys(dist).reduce((best, m) => (dist[m] > dist[best] ? m : best));
}
