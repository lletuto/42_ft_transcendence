import type { ComponentType } from 'react'

import Level00 from '@/app/jeu/levels/Level00'
import Level01 from '@/app/jeu/levels/Level01'
import Level02 from '@/app/jeu/levels/Level02'
import Level03 from '@/app/jeu/levels/Level03'

export type Level = {
  id: string
  title: string
  description: string
  targetScore: number
  nextLevelId: string | null
  component: ComponentType<{
    nextLevelPath?: string
    homePath?: string
  }>
}

export const levels: Level[] = [
  {
    id: 'level00',
    title: 'Pierre-Feuille-Ciseaux',
    description: 'Atteins 5 points pour passer au niveau suivant !',
    targetScore: 5,
    nextLevelId: 'level01',
    component: Level00,
  },
  {
    id: 'level01',
    title: 'Niveau 2',
    description: 'Un autre défi !',
    targetScore: 10,
    nextLevelId: 'level02',
    component: Level01,
  },
  {
    id: 'level02',
    title: 'Niveau 3',
    description: 'Le well entre en jeu.',
    targetScore: 10,
    nextLevelId: 'level03',
    component: Level02,
  },
  {
    id: 'level03',
    title: 'Niveau 4',
    description: 'Le dernier palier.',
    targetScore: 10,
    nextLevelId: null,
    component: Level03,
  },
]

export const getLevelById = (levelId: string) =>
  levels.find((level) => level.id === levelId)