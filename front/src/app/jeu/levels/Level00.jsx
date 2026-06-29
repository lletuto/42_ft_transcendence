'use client' 

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import GameScene from '@/components/rps3d/GameScene'
import { RockButton, PaperButton, ScissorsButton } from '@/components/buttons'
import RPSBot from '@/components/RPSBot'
import GameWrapper from '../lib/GameWrapper'

export default function Level00({ nextLevelPath = '/jeu?mode=bot&niveau=1', homePath = '/jeu', difficulty = 'medium' }) {
  const [score, setScore] = useState(0)
  const [botScore, setBotScore] = useState(0)
  const [result, setResult] = useState(null)
  const [botChoice, setBotChoice] = useState(null)
  const [playerChoiceText, setPlayerChoiceText] = useState(null)
  const [sceneChoices, setSceneChoices] = useState({ left: 'idle', right: 'idle' })
  const [animationRequestId, setAnimationRequestId] = useState(0)
  const [showVictoryMessage, setShowVictoryMessage] = useState(false)
  const [showLooserMessage, setShowLooserMessage] = useState(false)
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

  const router = useRouter()

  useEffect(() => {
    return () => {
      if (endMessageTimeoutRef.current) clearTimeout(endMessageTimeoutRef.current)
      if (unlockTimeoutRef.current) clearTimeout(unlockTimeoutRef.current)
    }
  }, [])
  /*setting the bot*/ 
  const botRef = useRef(null)
  if (botRef.current === null) {
    botRef.current = new RPSBot(difficulty)
    botRef.current.setLevel(0)
  }

  /*Makes out the winner */
  const getResult = (player, bot) => {
    if (player === bot) return 'draw'
    if (
      (player === 'rock' && bot === 'scissors') ||
      (player === 'scissors' && bot === 'paper') ||
      (player === 'paper' && bot === 'rock')
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
    if (!gameEnded || hasRedirected) {
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
    return null
  }
/*called when the player makes a choice, it updates the state and triggers the bot's 
move and the result of the round. It also handles the end of the game if either player reaches 5 points. */
  const handleChoice = (playerChoice) => {
    if (gameEnded || activeChoice) return

    setActiveChoice(playerChoice)
    setPlayerChoiceText(playerChoice)

    setSceneChoices({ left: 'idle', right: 'idle' })

    botRef.current.updateScore(botScore, score)
    const bot = botRef.current.chooseMove()
    const outcome = getResult(playerChoice, bot)
    botRef.current.recordHumanMove(playerChoice)
    
    let nextScore = score
    let nextBotScore = botScore
    setBotChoice(bot)
    setResult(outcome)

    setTimeout(() => {
      setAnimationRequestId((currentValue) => currentValue + 1)
      setSceneChoices({ left: playerChoice, right: bot })
    }, 0)

    if (outcome === 'win') {
      const next = score + 1
      setScore(next)
      if (next >= 5) {
        setTimeout(() => triggerEndSequence('left'), 10)
        return 
      }
    }
    else if (outcome === 'lose') {
      nextBotScore = botScore + 1
      setBotScore(nextBotScore)
      if (nextBotScore >= 5) {
        setTimeout(() => triggerEndSequence('right'), 10)
        return 
      }
    }

    unlockTimeoutRef.current = setTimeout(() => {
      setActiveChoice(null)
    }, 2000)
  }

  return (
<div className="relative overflow-hidden text-white  h-full w-full bg-transparent ">
			<GameWrapper> 
      {/*THREE.JS SCENE */}
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

      {/* HUD OVERLAY */}
      <div className="absolute inset-0 p-4 sm:p-6 flex flex-col justify-between pointer-events-none z-10">

        <div className="flex flex-row justify-between items-start w-full gap-4">

          <div className="w-1/4" />

          <div className="flex flex-col items-center gap-2 flex-1">

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

            {/* Victory message*/}
            {showVictoryMessage && (
                <div className="pointer-events-auto text-center text-xl md:text-2xl lg:text-3xl font-black text-rose-500 drop-shadow-[0_0_12px_rgba(244,63,94,0.8)] tracking-wide animate-bounce mx-auto mt-4">
                    You wonnnnn championnnnn !!!
                </div>
            )}

            {/* Loss message*/}
            {showLooserMessage && (
                <div className="pointer-events-auto text-center text-xl md:text-2xl lg:text-3xl font-black text-orange-500 drop-shadow-[0_0_12px_rgba(249,115,22,0.8)] tracking-wide animate-bounce mx-auto mt-4">
                    You lost... Like a loser !
                </div>
            )}
          </div>

          {/* Right corner : Level info */}
          <div className="pointer-events-auto p-4 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 shadow-2xl text-right w-1/4 min-w-[140px]">
            <h1 className="font-bold text-base sm:text-xl lg:text-2xl text-stone-200 mb-1 tracking-wide">
              Level 0
            </h1>
            <p className="text-xs sm:text-sm lg:text-base text-amber-400 font-bold tracking-wider mb-1">
              First to 5 pts
            </p>
            <div className="border-t border-white/10 my-1" />
            <p className="text-xs sm:text-sm lg:text-base text-stone-300 leading-relaxed">
              Reach <span className="font-bold text-amber-400">5 points</span> to advance to the next level.
            </p>
          </div>

        </div>

        {/* 3d buttons */}
        {!gameEnded && (
          <div className={`pointer-events-auto absolute right-4 sm:right-6 top-3/4 -translate-y-1/2 flex flex-col gap-3 sm:gap-4 z-20 transition-opacity duration-200 ${activeChoice ? 'opacity-80' : ''}`}>
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
          </div>
        )}

        {/*Skip button */}
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

      </div>
	  </GameWrapper> 
	  
    </div>
  )
}