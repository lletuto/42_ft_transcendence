'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import GameScene from '@/components/rps3d/GameScene'
import { PaperButton, RockButton, ScissorsButton, WellButton } from '@/components/buttons'
import RPSBot from '@/components/RPSBot'
import GameWrapper from '../lib/GameWrapper'

export default function Level02({ nextLevelPath = '/jeu?mode=bot&niveau=3', homePath = '/jeu', difficulty = 'medium' }) {
  const [score, setScore] = useState(0)
  const [botScore, setBotScore] = useState(0)
  const [result, setResult] = useState(null)
  const [botChoice, setBotChoice] = useState(null)
  const [playerChoiceText, setPlayerChoiceText] = useState(null)
  const [sceneChoices, setSceneChoices] = useState({ left: 'idle', right: 'idle' })
  const [animationRequestId, setAnimationRequestId] = useState(0)
  const [showVictoryMessage, setShowVictoryMessage] = useState(false)
  const [showLooserMessage, setShowLooserMessage] = useState(false)
  const [playerCombo, setPlayerCombo] = useState([])
  const [botCombo, setBotCombo] = useState([]) 
  const [bonusMessage, setBonusMessage] = useState('')
  const [gameEnded, setGameEnded] = useState(false)
  const [endWinnerSide, setEndWinnerSide] = useState(null)
  const [hasRedirected, setHasRedirected] = useState(false)
  const [showSkipButton, setShowSkipButton] = useState(false)
  
  const [cameraConfig, setCameraConfig] = useState({
    position: null,
    target: null
  })

  const [activeChoice, setActiveChoice] = useState(null)

  const endMessageTimeoutRef = useRef(null)
  const unlockTimeoutRef = useRef(null)
  const comboClearTimeoutRef = useRef(null)

  const router = useRouter()

  useEffect(() => {
    return () => {
      if (endMessageTimeoutRef.current) clearTimeout(endMessageTimeoutRef.current)
      if (unlockTimeoutRef.current) clearTimeout(unlockTimeoutRef.current)
      if (comboClearTimeoutRef.current) clearTimeout(comboClearTimeoutRef.current)
    }
  }, [])
  
  const botRef = useRef(null)
  if (botRef.current === null) {
    botRef.current = new RPSBot(difficulty)
    botRef.current.setLevel(2)
  }

  const bonusCombinations = [
    { pattern: ['rock', 'rock', 'rock'], bonusType: 'ROCKS', bonusPoints: 1 },
    { pattern: ['paper', 'paper', 'paper'], bonusType: 'PAPERS', bonusPoints: 1 },
    { pattern: ['scissors', 'scissors', 'scissors'], bonusType: 'SCISSORS', bonusPoints: 1 },
  ]

  const resolveBonusCombo = (moves) =>
    bonusCombinations.find((combo) => JSON.stringify(combo.pattern) === JSON.stringify(moves)) ?? null

  const getResult = (player, bot) => {
    if (player === bot) return 'draw'
    if (
      (player === 'rock' && bot === 'scissors') ||
      (player === 'scissors' && bot === 'paper') ||
      (player === 'paper' && bot === 'rock') ||
      (player === 'paper' && bot === 'well') ||
      (player === 'well' && bot === 'scissors') ||
      (player === 'well' && bot === 'rock')
    ) return 'win'
    return 'lose'
  }

  const triggerEndSequence = (winnerSide) => {
    setGameEnded(true)
    setEndWinnerSide(winnerSide)
    setShowSkipButton(true)

    setCameraConfig({
      position: [0, 2, 20],
      target: [0, 2, 0]
    })

    setSceneChoices(
      winnerSide === 'left'
        ? { left: 'winner', right: 'loser' }
        : { left: 'loser', right: 'winner' },
    )
    setAnimationRequestId((currentValue) => currentValue + 1)

    endMessageTimeoutRef.current = setTimeout(() => {
      if (winnerSide === 'left') {
        setShowVictoryMessage(true)
      } else {
        setShowLooserMessage(true)
      }
    }, 900)
  }

  const handlePlayerFinished = (side, choice) => {
    if (!gameEnded || hasRedirected || choice !== 'winner' || side !== endWinnerSide) {
      return
    }

    setHasRedirected(true)
    setShowSkipButton(false)
    router.push(side === 'left' ? nextLevelPath : homePath)
  }

  const handleSkip = () => {
    if (!gameEnded || hasRedirected ) {
      return
    }

    setHasRedirected(true)
    setShowSkipButton(false)
    if (endMessageTimeoutRef.current) clearTimeout(endMessageTimeoutRef.current)

    router.push(endWinnerSide === 'left' ? nextLevelPath : homePath)
  }

  const translateChoice = (choice) => {
    if (choice === 'rock') return 'Rock'
    if (choice === 'paper') return 'Paper'
    if (choice === 'scissors') return 'Scissors'
    if (choice === 'well') return 'Well'
    return null
  }

  const handleChoice = (playerChoice) => {
    if (gameEnded || activeChoice) return

    setActiveChoice(playerChoice)
    setPlayerChoiceText(playerChoice)
    setSceneChoices({ left: 'idle', right: 'idle' })

    botRef.current.updateScore(botScore, score)
    const bot = botRef.current.chooseMove()
    const outcome = getResult(playerChoice, bot)
    botRef.current.recordHumanMove(playerChoice)
    
    const lastPlayerSign = playerCombo.length > 0 ? playerCombo[playerCombo.length - 1] : null
    let nextPlayerCombo
    if (playerChoice === 'well') {
      nextPlayerCombo = [] 
    } else {
      if (playerChoice !== lastPlayerSign) {
        nextPlayerCombo = [playerChoice]
      } else if (playerCombo.length < 3) {
        nextPlayerCombo = [...playerCombo, playerChoice]
      } else {
        nextPlayerCombo = [playerChoice]
      }
    }

    const lastBotSign = botCombo.length > 0 ? botCombo[botCombo.length - 1] : null
    let nextBotCombo
    if (bot === 'well') {
      nextBotCombo = [] 
    } else {
      if (bot !== lastBotSign) {
        nextBotCombo = [bot]
      } else if (botCombo.length < 3) {
        nextBotCombo = [...botCombo, bot]
      } else {
        nextBotCombo = [bot]
      }
    }

    const playerComboComplete = nextPlayerCombo.length === 3
    const botComboComplete = nextBotCombo.length === 3
    let nextScore = score
    let nextBotScore = botScore

    if (playerComboComplete) {
      if (outcome === 'win') {
        const bonusCombo = resolveBonusCombo(nextPlayerCombo)
        const bonusPoints = bonusCombo?.bonusPoints ?? 0
        nextScore = score + 1 + bonusPoints
        setBonusMessage('🎉 Bonus ! +1 point for the special combination !')
        setTimeout(() => setBonusMessage(''), 3000)
      }
      if (comboClearTimeoutRef.current) clearTimeout(comboClearTimeoutRef.current)
      comboClearTimeoutRef.current = setTimeout(() => setPlayerCombo([]), 550)
      setPlayerCombo(nextPlayerCombo)
    } else {
      if (outcome === 'win') {
        nextScore = score + 1
      }
      setPlayerCombo(nextPlayerCombo)
    }

    if (botComboComplete) {
      if (outcome === 'lose') {
        const bonusCombo = resolveBonusCombo(nextBotCombo)
        const bonusPoints = bonusCombo?.bonusPoints ?? 0
        nextBotScore = botScore + 1 + bonusPoints
        setBonusMessage(`🤖 The bot has a bonus ! +${bonusPoints} point(s) !`)
        setTimeout(() => setBonusMessage(''), 3000)
      }
      if (comboClearTimeoutRef.current) clearTimeout(comboClearTimeoutRef.current)
      comboClearTimeoutRef.current = setTimeout(() => setBotCombo([]), 550)
      setBotCombo(nextBotCombo)
    } else {
      if (outcome === 'lose') {
        nextBotScore = botScore + 1
      }
      setBotCombo(nextBotCombo)
    }

    if (playerChoice === 'well' && outcome === 'lose') {
      nextScore = Math.max(0, nextScore - 2)
    }

    setScore(nextScore)
    setBotScore(nextBotScore)
    setBotChoice(bot)
    setResult(outcome)

    setTimeout(() => {
      setAnimationRequestId((currentValue) => currentValue + 1)
      setSceneChoices({ left: playerChoice, right: bot })
    }, 0)

    if (nextScore >= 10) {
      setTimeout(() => triggerEndSequence('left'), 10)
      return
    } else if (nextBotScore >= 10) {
      setTimeout(() => triggerEndSequence('right'), 10)
      return
    }

    unlockTimeoutRef.current = setTimeout(() => {
      setActiveChoice(null)
    }, 1800)
  }

  return (
<div className="relative overflow-hidden text-white  h-full w-full bg-transparent ">
			<GameWrapper>
      {/* 1. THREE.JS SCENE */}
      <div className="absolute inset-0 w-full h-full">
        <GameScene
          className="w-full h-full"
          playerChoices={sceneChoices}
          animationRequestId={animationRequestId}
          onPlayerFinished={handlePlayerFinished}
          cameraPosition={cameraConfig.position}
          cameraTarget={cameraConfig.target}
        />
      </div>

      {/* 2. HUD  */}
      <div className="absolute inset-0 p-4 sm:p-6 flex flex-col justify-between pointer-events-none z-10">

        {/* TOP ROW : 3 columns*/}
        <div className="flex flex-row justify-between items-start w-full gap-4">

          {/* LEFT: Combo  */}
          <div className="w-1/4">
            {!gameEnded && playerCombo.length > 0 && (
              <div className="pointer-events-auto p-2 rounded-xl bg-black/40 backdrop-blur-sm border border-white/5 inline-block text-[10px] sm:text-xs lg:text-sm text-stone-400 font-medium tracking-wide max-w-full">
                Combo : {' '}
                <span className="text-rose-400 font-mono font-bold uppercase drop-shadow-[0_0_6px_rgba(244,63,94,0.3)]">
                  {playerCombo.map(c => translateChoice(c)).join(' ➔ ')}
                </span>
              </div>
            )}
          </div>

          {/* CENTER : Score + messages */}
          <div className="flex flex-col items-center gap-3 flex-1">

            {/* score */}
            <div className="pointer-events-auto flex flex-col items-center justify-center bg-black/60 backdrop-blur-md px-6 sm:px-8 py-3 sm:py-4 rounded-3xl border border-white/10 shadow-2xl min-w-[200px] sm:min-w-[240px] lg:min-w-[320px]">

              <span className="text-[10px] lg:text-xl uppercase tracking-widest text-white/40 font-bold mb-1">
                Score
              </span>

              <div className="text-3xl sm:text-4xl lg:text-5xl font-black font-mono tracking-wider flex items-center gap-4">
                <span className="text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.4)]">{score}</span>
                <span className="text-white/20 text-xl sm:text-2xl lg:text-3xl font-normal">-</span>
                <span className="text-orange-500/70">{botScore}</span>
              </div>

              {result && !gameEnded && (
                <div className="w-full grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-white/5 text-center text-xs lg:text-sm font-semibold uppercase tracking-wider">
                  <div className="text-rose-400/90">{translateChoice(playerChoiceText)}</div>
                  <div className="text-orange-400/60">{translateChoice(botChoice)}</div>
                </div>
              )}

              {/* Verdict */}
              {result && !gameEnded && (
                <div className="mt-2 text-sm lg:text-base font-black uppercase tracking-widest">
                  <span className={
                    result === 'win'
                      ? 'text-rose-500 drop-shadow-[0_0_10px_rgba(244,63,94,0.6)]'
                      : result === 'lose'
                      ? 'text-orange-500 drop-shadow-[0_0_10px_rgba(249,115,22,0.5)]'
                      : 'text-stone-400'
                  }>
                    {result === 'win' ? 'Won !' : result === 'lose' ? 'Lost...' : 'Tie'}
                  </span>
                </div>
              )}
            </div>

            {/* bonus messages */}
            {bonusMessage && (
              <div className="pointer-events-auto text-center text-xs sm:text-sm lg:text-base font-bold bg-amber-500/80 text-black px-5 py-1.5 lg:px-7 lg:py-2 rounded-full border border-amber-400/50 shadow-[0_0_15px_rgba(245,158,11,0.4)] lg:shadow-[0_0_22px_rgba(245,158,11,0.6)] tracking-wide animate-pulse w-max max-w-[90vw] whitespace-nowrap">
			{bonusMessage}
				</div>
            )}

            {/* victory message */}
            {showVictoryMessage && (
              <div className="pointer-events-auto text-center text-xl md:text-2xl lg:text-3xl font-black text-rose-500 drop-shadow-[0_0_12px_rgba(244,63,94,0.8)] tracking-wide animate-bounce mx-auto">
                You wonnnnn championnnnn !!!
              </div>
            )}

            {/* looser message */}
            {showLooserMessage && (
              <div className="pointer-events-auto text-center text-xl md:text-2xl lg:text-3xl font-black text-orange-500 drop-shadow-[0_0_12px_rgba(249,115,22,0.8)] tracking-wide animate-bounce mx-auto">
                You lost... Like a loser !
              </div>
            )}
          </div>

          {/* RIGHT : level and game rules */}
          <div className="pointer-events-auto p-4 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 shadow-2xl text-right w-1/4 min-w-[140px]">
            <h1 className="font-bold text-base sm:text-xl lg:text-2xl text-stone-200 mb-1 tracking-wide">
              Level 2
            </h1>
            <p className="text-xs sm:text-sm lg:text-base text-amber-400 font-bold uppercase tracking-wider mb-1">
              The Well is here!
            </p>
            <div className="border-t border-white/10 my-1" />
            <p className="text-[11px] sm:text-xs lg:text-sm text-stone-300 leading-relaxed">
              It beats rock & scissors, but loses to paper.
            </p>
            <p className="text-[11px] sm:text-xs lg:text-sm text-stone-300 mt-1 leading-relaxed">
              <span className="font-bold text-red-400">Warning :</span> losing with it costs{' '}
              <span className="font-bold text-red-400">-2 points</span>!
            </p>
          </div>

        </div>

      </div>

      {/* buttons right */}
      {!gameEnded && (
        <div className={`pointer-events-auto absolute right-4 sm:right-6 top-3/5 -translate-y-1/2 flex flex-col gap-3 sm:gap-4 z-20 transition-opacity duration-200 ${activeChoice ? 'opacity-80' : ''}`}>
          <RockButton
            onClick={() => handleChoice('rock')}
            className={`transform active:scale-95 transition-transform ${activeChoice === 'rock' ? '!scale-110' : activeChoice ? 'opacity-40 pointer-events-none' : ''}`}
          />
          <PaperButton
            onClick={() => handleChoice('paper')}
            className={`transform active:scale-95 transition-transform ${activeChoice === 'paper' ? '!scale-110' : activeChoice ? 'opacity-40 pointer-events-none' : ''}`}
          />
          <ScissorsButton
            onClick={() => handleChoice('scissors')}
            className={`transform active:scale-95 transition-transform ${activeChoice === 'scissors' ? '!scale-110' : activeChoice ? 'opacity-40 pointer-events-none' : ''}`}
          />
          <WellButton
            onClick={() => handleChoice('well')}
            className={`transform active:scale-95 transition-transform ${activeChoice === 'well' ? '!scale-110' : activeChoice ? 'opacity-40 pointer-events-none' : ''}`}
          />
        </div>
      )}

      {/* skip button*/}
      {showSkipButton && (
        <div className="pointer-events-none absolute bottom-4 right-4 sm:bottom-6 sm:right-6 lg:bottom-8 lg:right-8 z-20">
          <button
            type="button"
            onClick={handleSkip}
            className="pointer-events-auto rounded-full border border-white/30 bg-black/40 backdrop-blur-sm px-4 py-2 lg:px-6 lg:py-3 text-xs lg:text-sm font-semibold uppercase tracking-[0.22em] text-white/85 transition-all duration-200 hover:bg-white/10 hover:text-white active:scale-95 shadow-lg"
          >
            Skip animation
          </button>
        </div>
      )}
	  </GameWrapper> 
    </div>
  )
}