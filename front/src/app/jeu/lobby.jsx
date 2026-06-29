// ====================================================================================
// This file orchestrates the Client-Side Multi-user Lobby and Gameplay interface 
// for a real-time, 3D rock-paper-scissors game powered by Next.js and WebSockets.
//
// --- STRUCTURE ---
// 1. MODULE IMPORTS & INLINE STYLING DEFINITIONS
//    - Loads dependencies and defines JavaScript-in-CSS configuration objects for components.
// 2. MAIN COMPONENT INITIALIZATION (`LobbyMulti`)
//    - Orchestrates client-side states, tracking connection tokens, socket identifiers, score counts,
//      game combos, and responsive layout properties.
// 3. PERSISTENT OBJECT REFS (`useRef`)
//    - Safeguards references to the underlying WebSocket instance (`socketRef`), cleanup timers, and 
//      volatile username strings, maintaining state integrity between asynchronous execution loops.
// 4. EVENT-DRIVEN WEBSOCKET INITIALIZATION FLUSH (`useEffect`)
//    - Mounts on initial render to execute a secure socket handshake. Binds network packet 
//      listeners (`socket.on`) to handle room routing, live dynamic results, and fallback states.
// 5. 3D RENDER ANIMATION MATRIX SYNCHRONIZER (`useEffect`)
//    - Reacts to state alterations on active player records to dynamically synchronize 3D character animations.
// 6. REACTION HANDLERS & DATA DISPATCHERS
//    - Handles actions like creating rooms, sending selected player moves, skipping end-game cinematics, 
//      and managing rematches.
// 7. 3 SCREEN RENDER CONTROLLERS (Conditional Component Rendering Stack)
//    - Level A: END-OF-GAME SCREEN (Triggers upon validation of a final match winner).
//    - Level B: ACTIVE GAME SCREEN (Renders WebGL canvas and overlay dashboard interfaces).
//    - Level C: PRE-GAME SELECTION LOBBY (Default landing state for room generation and matchmaking).
// ====================================================================================

'use client' // NEXT.JS DIRECTIVE: Informs Next.js that this component runs entirely in the browser (Client Component).


import { useRef, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
// [LIBRARY: Socket.io-Client] -> Provides real-time, bi-directional, event-driven network communication via WebSockets.
import { io } from 'socket.io-client'
import GameScene from '@/components/rps3d/GameScene'
import { PaperButton, RockButton, ScissorsButton, WellButton } from '@/components/buttons'
import InputBox from '@/components/InputBox'
import GameWrapper from './lib/GameWrapper'

//----------------------------------------------------------------


const levelRules = {
  0: "Classic mode. Rock, Paper, Scissors.",
  1: "Combo Bonus! Aligning the same sign 3 times in a row grants +1 bonus point.",
  2: "The Well is added! Well beats rock and scissors, but loses to paper. Bonuses are still available.",
  3: "Giga Bonus: the combo well → well → well grants +2 bonus points!\nBonuses are still available for the combo you know, but maybe for others too... Find the secrets combinations!",
}

const choiceLabels = {
  rock: 'Rock',
  paper: 'Paper',
  scissors: 'Scissors',
  well: 'Well',
  idle: ''
}



//----------------------------------------------------------------

export default function LobbyMulti() {

  // STATE MANAGEMENT SYSTEMS 
  // we have fifferent type of state :user interface state, game state, network state, 3D animation state, and system execution pointers.
  // useState is a React Hook that allows us to add state to functional components. It returns an array with two elements: the current state value and a function to update it.

  const [connected, setConnected] = useState(false)
  const [gameId, setGameId] = useState('')
  const [joinInput, setJoinInput] = useState('')
  const [mounted, setMounted] = useState(false)
  
  // Dynamic State Initialization with LocalStorage Synchronization (Browser API)
  const [level, setLevel] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedLevel = localStorage.getItem('selected_game_level')
      return savedLevel !== null ? Number(savedLevel) : 0
    }
    return 0
  })
  
  const [levelSync, setLevelSync] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [inGame, setInGame] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [player1, setPlayer1] = useState('')
  const [player2, setPlayer2] = useState('')
  const [currentGameId, setCurrentGameId] = useState('')
  const [score1, setScore1] = useState(0)
  const [score2, setScore2] = useState(0)
  const [myChoice, setMyChoice] = useState(null)
  const [lastResult, setLastResult] = useState(null)
  const [waiting, setWaiting] = useState(false)
  const [winner, setWinner] = useState(null)
  const [rematchAsked, setRematchAsked] = useState(false)
  const [waitingRematch, setWaitingRematch] = useState(false)
  const [reconnecting, setReconnecting] = useState(false)
  const [bonusMessage, setBonusMessage] = useState('')
  const [myUsername, setMyUsername] = useState('')
  const [amIPlayer1, setAmIPlayer1] = useState(true)

  // 3D Canvas Event hooks
  const [sceneChoices, setSceneChoices] = useState({ left: 'idle', right: 'idle' })
  const [animationRequestId, setAnimationRequestId] = useState(0)
  const [activeChoice, setActiveChoice] = useState(null)
  const [playerCombo, setPlayerCombo] = useState([])
  const [isCelebrating, setIsCelebrating] = useState(false)


  //-----------------



  // MUTABLE MEMORY REFERENCES 
  // Used to store mutable values that persist across renders without triggering a re-render loop.
  // useRef is a React Hook that returns a mutable ref object whose .current property is initialized to the passed argument (initialValue). The  returned object will persist for the full lifetime of the component. Useref gives the real time value of the variable.
  const usernameRef = useRef('')
  const player1Ref = useRef('')
  const player2Ref = useRef('') 

  const socketRef = useRef(null)
  const unlockTimeoutRef = useRef(null)
  const gameOverTimeoutRef = useRef(null)
  const bonusTimeoutRef = useRef(null)

  const maxScore = level === 0 ? 5 : 10

    // Animation Skip Action Handler
  const handleSkipAnimation = () => {
    if (gameOverTimeoutRef.current) clearTimeout(gameOverTimeoutRef.current)
    setIsCelebrating(false)
    setGameOver(true)
    setInGame(false)
  }



  //-----------------


  //LIFE CYCLE HOOKS
  // UseEffect is a React Hook that allows us to perform side effects in functional components. It takes a function as an argument and runs it after the component renders. We can also specify dependencies for the effect, so it only runs when those dependencies change.
  // useEffect works as : when [dependencies] change, the function inside useEffect is executed. If the dependencies array is empty, the function runs only once after the initial render.

  // Hydration fix 
  // hydration is the process of taking a server-rendered HTML page and attaching event listeners to it so that it becomes interactive. In React, this is done by rendering the component on the server and then sending the HTML to the client, where React takes over and attaches event listeners to the elements. This useEffect hook sets the mounted state to true after the component has been rendered on the client, which prevents any server-side rendering issues.
  useEffect(() => {
    setMounted(true)
  }, [])


  // SYNCHRONIZATION EFFECT HOOK
  // Syncs volatile string references so event-driven network callbacks have immediate access to current data.
  useEffect(() => {
    if (myUsername && player1) {
      setAmIPlayer1(myUsername === player1)
    }
    usernameRef.current = myUsername
    player1Ref.current = player1
    player2Ref.current = player2 
  }, [myUsername, player1, player2])


  // REAL-TIME WEBSOCKET NETWORK INTERFACE INITIALIZATION (SINGLETON PATTERN)
  // This hook opens a single connection stream to the backend orchestration server.
  useEffect(() => {
    // Spawns instance configuration with customized transmission routes
    const socket = io(`https://${window.location.hostname}:8443`, {
      withCredentials: true,
      // polling EN PLUS de websocket : fallback robuste au 1er chargement (F5).
      transports: ['polling', 'websocket'],
      // forceNew : connexion DÉDIÉE au jeu, pas partagée avec le socket /presence
      // du layout. Au refresh, les deux ne se marchent plus dessus.
      forceNew: true,
    })

	  	// Socket.on is an Event Listener. The WebSocket architecture sits open waiting for packets.
  		// When the backend server fires an event matching the designated key string, the code 
  		// block below executes asynchronously, unpacking injected payload parameters (`data`).

    // Event: Connection confirmation established with the server proxy
    let authRetry = false
    socket.on('connect', () => {
      setConnected(true)
      authRetry = false // (re)connexion OK : on réarme le retry pour la prochaine fois
    })

    // Event: Unexpected network disconnection or packet drop
    socket.on('disconnect', (reason) => {
      setConnected(false)
      // 'io server disconnect' = le SERVEUR nous a coupés (souvent jwt expiré).
      // Dans ce cas socket.io ne réessaie pas tout seul : on renouvelle le jwt
      // puis on se reconnecte. authRetry évite une boucle infinie.
      if (reason === 'io server disconnect' && !authRetry) {
        authRetry = true
        fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' })
          .then((r) => { if (r.ok) socket.connect() })
          .catch(() => {})
      }
    })
    
    // Event: Handshake acknowledging that a designated game room lobby has been generated
	// (data) -> datas sent by the server backend
	// {} -> what I execute on front side when the event is received 
    socket.on('RoomCreated', (data) => {
      setGameId(data.roomId)
      if (data.level !== undefined) setLevel(data.level)
    })

    // Event: Identity allocation packet sent by server auth middleware
    socket.on('Identity', (data) => {
      setMyUsername(data.username)
      usernameRef.current = data.username
    })

    // Event: Room matchmaking complete. Signals to clear game boards and display the canvas.
    socket.on('gameReady', (data) => {
      setLevel(data.level)
      setPlayer1(data.player1)
      setPlayer2(data.player2)
      player1Ref.current = data.player1 
      player2Ref.current = data.player2 
      setCurrentGameId(data.gameId)
      setScore1(0)
      setScore2(0)
      
      setMyChoice(null)
      setActiveChoice(null)       
      setPlayerCombo([])
      setBonusMessage('')
      setSceneChoices({ left: 'idle', right: 'idle' }) 
      if (unlockTimeoutRef.current) clearTimeout(unlockTimeoutRef.current) 
      if (bonusTimeoutRef.current) clearTimeout(bonusTimeoutRef.current)
      
      setLastResult(null)
      setWaiting(false)
      setWinner(null)
      setGameOver(false)
      setIsCelebrating(false)
      setRematchAsked(false)
      setWaitingRematch(false)
      setReconnecting(false)
      
      setLevelSync(true)
      setInGame(true)
    })

    // Event: Both players have submitted moves. Processes scores and detects combos.
    socket.on('Result', (data) => {
      setScore1(data.player1)
      setScore2(data.player2)
      setLastResult(data.message.winner)
      if (data.level !== undefined) setLevel(data.level) 
      setWaiting(false)
      setReconnecting(false)

      if (data.bonus && data.bonus !== 0 && data.level !== 0) {
        const recipient = data.message.winner 
        const currentIsP1 = usernameRef.current === player1Ref.current
        const isMeConcerned = (recipient === 'player1' && currentIsP1) || (recipient === 'player2' && !currentIsP1)
        
        if (data.level === 3 && isMeConcerned) {
          setPlayerCombo([]) // Clears historical arrays upon triggering top-tier rewards
        }

        let displayName = ''
        if (isMeConcerned) {
          displayName = "You got"
        } else {
          const opponentNameString = recipient === 'player1' ? player1Ref.current : player2Ref.current
          displayName = `${opponentNameString} got`
        }

        const bonusPoints = data.bonus === 3 ? 2 : 1

        let msgText = ''
        if (data.bonus === 1) msgText = `🎉 ${displayName} a +1 bonus point for the SPECIAL combination!`
        if (data.bonus === 2) msgText = `🎉 ${displayName} a +1 bonus point for the SECRET combination!`
        if (data.bonus === 3) msgText = `🔥 GIGA BONUS! ${displayName} +2 points for the ultimate combination!`

        setBonusMessage(msgText)

        if (bonusTimeoutRef.current) clearTimeout(bonusTimeoutRef.current)
        bonusTimeoutRef.current = setTimeout(() => {
          setBonusMessage('')
        }, 4500)
      }
    })

    // Event: A player has won the game.
    socket.on('Winner', (data) => {
      setScore1(data.player1); setScore2(data.player2)
      setWinner(data.message.winner)
      if (data.level !== undefined) setLevel(data.level)
      setWaiting(false)
      setReconnecting(false)
    })

    // Event: Disconnection payload fired if the opponent bails mid-match.
    socket.on('leaveGame', (data) => {
      setErrorMsg(data.message || "The opponent left the game.")
      setInGame(false)
      setLevelSync(false)
      setCurrentGameId('')
      setGameId('')
      setWinner(null)
      setGameOver(false)
      setActiveChoice(null)
      setPlayerCombo([])
      setBonusMessage('')
      setReconnecting(false)
      setSceneChoices({ left: 'idle', right: 'idle' })
    })

    // Event: General error tracking, handles disconnections with a 30s grace period for reconnects.
    socket.on('Error', (data) => {
      if (data.message === 'A player disconnected, waiting for reconnexion' || data.message?.includes('disconnected')) {
        setReconnecting(true)
      } else {
        setReconnecting(false)
        setErrorMsg(data.message)
        setInGame(false)
        setGameOver(false)
        setWinner(null)
        setIsCelebrating(false)
        setRematchAsked(false)
        setWaitingRematch(false)
        setTimeout(() => setErrorMsg(''), 4000)
      }
    })

    // Event: Success confirmation returning a re-authenticated client to an active match.
    socket.on('Reconnecting', (data) => {
      setPlayer1(data.player1)
      setPlayer2(data.player2)
      player1Ref.current = data.player1 
      player2Ref.current = data.player2 
      setCurrentGameId(data.gameId)
      setScore1(data.score1)
      setScore2(data.score2)
      if (data.level !== undefined) setLevel(data.level)
      
      setMyChoice(null)
      setWaiting(false)
      setReconnecting(false) 
      setLevelSync(true)
      setInGame(true)
    })

    socket.on('error', (data) => { 
      setErrorMsg(data.message)
      setTimeout(() => setErrorMsg(''), 4000) 
    })

    socketRef.current = socket

    // Component Disconnect / Unmount cleanup loop to prevent memory leaks
	// it is executed when the component is unmounted or when the dependencies change. It is used to clean up any side effects that were created in the useEffect hook, such as event listeners or timers.
    return () => {
   	  socket.removeAllListeners() // listeners can be attached many times
      socket.disconnect() // remove open sockets
      if (unlockTimeoutRef.current) clearTimeout(unlockTimeoutRef.current)
      if (gameOverTimeoutRef.current) clearTimeout(gameOverTimeoutRef.current)
      if (bonusTimeoutRef.current) clearTimeout(bonusTimeoutRef.current)
    }
  }, []) 



	//-----------------


  // 3D ANIMATION LOOP SYNCHRONIZER [React Side-Effect Loop]
  // Intercepts socket events to dynamically trigger Three.js state alterations inside <GameScene />.
  useEffect(() => {
    if (!socketRef.current) return

	//handleResultAnimation and handleWinnerAnimation are functions that are called when the 'Result' and 'Winner' events are received from the server. They update the sceneChoices state to trigger the appropriate animations in the GameScene component.
    const handleResultAnimation = (data) => {
      const isP1 = usernameRef.current === player1Ref.current
      const localMyChoice = isP1 ? data.choice1 : data.choice2
      const localOpponentChoice = isP1 ? data.choice2 : data.choice1

      // Inject choice tags into the 3D sub-context canvas frame
      setSceneChoices({ left: localMyChoice || 'idle', right: localOpponentChoice || 'idle' })
      setAnimationRequestId(v => v + 1)
      setMyChoice(null)

      if (unlockTimeoutRef.current) clearTimeout(unlockTimeoutRef.current)
      unlockTimeoutRef.current = setTimeout(() => {
        setSceneChoices({ left: 'idle', right: 'idle' })
        setAnimationRequestId(v => v + 1)
        setActiveChoice(null) // Unlocks action button interactive states
      }, 2500)
    }

    const handleWinnerAnimation = (data) => {
      const isP1 = usernameRef.current === player1Ref.current
      const iWon = (data.message.winner === 'player1' && isP1) || (data.message.winner === 'player2' && !isP1)
      
      // Directs character animations to either 'winner' or 'loser' skeletal frameworks
      setSceneChoices(iWon ? { left: 'winner', right: 'loser' } : { left: 'loser', right: 'winner' })
      setAnimationRequestId(v => v + 1)
      setIsCelebrating(true)
      
      if (gameOverTimeoutRef.current) clearTimeout(gameOverTimeoutRef.current)
      gameOverTimeoutRef.current = setTimeout(() => {
        setIsCelebrating(false)
        setGameOver(true)
        setInGame(false)
      }, 16000) 
    }

    // Connect functional sub-handlers to events
    socketRef.current.on('Result', handleResultAnimation)
    socketRef.current.on('Winner', handleWinnerAnimation)

    return () => {
      socketRef.current?.off('Result', handleResultAnimation)
      socketRef.current?.off('Winner', handleWinnerAnimation)
    }
  }, [])



	//-----------------


  // SENDING ACTIONS 
  // `socket.emit`: Fires an immediate data packet carrying
  // custom headers and variables up to the backend Node.js listener structure.
  const handleCreateRoom = () => socketRef.current?.emit('createRoom', { level })
  const handleJoinRoom = () => { if (socketRef.current && joinInput) socketRef.current.emit('JoinRoom', { gameId: joinInput }) }

  // Action Choice Dispatch Handler
  const handleChoice = (choice) => {
    if (!socketRef.current || waiting || reconnecting || activeChoice) return
    setActiveChoice(choice)
    setMyChoice(choice)
    setWaiting(true)
    setLastResult(null)

    let nextPlayerCombo

    if (level === 3) {
      // Slidewindow implementation array logic tracking the 3 latest commands
      nextPlayerCombo = [...playerCombo, choice]
      if (nextPlayerCombo.length > 3) {
        nextPlayerCombo.shift()
      }
    } else {
      // Standard Level 1 & 2 combo logic tracking identical moves
      const lastPlayerSign = playerCombo.length > 0 ? playerCombo[playerCombo.length - 1] : null
      if (choice === 'well') {
        nextPlayerCombo = []
      } else {
        if (choice !== lastPlayerSign) {
          nextPlayerCombo = [choice]
        } else if (playerCombo.length < 3) {
          nextPlayerCombo = [...playerCombo, choice]
        } else {
          nextPlayerCombo = [choice]
        }
      }
    }
    
    setPlayerCombo(nextPlayerCombo)
    socketRef.current.emit('choice', { gameId: currentGameId, choice })
  }

  const handleLeaveGame = () => {
    if (socketRef.current) {
      socketRef.current.emit('leaveGame')
    }
    setInGame(false)
    setLevelSync(false)
    setCurrentGameId('')
    setGameId('')
    setWinner(null)
    setGameOver(false)
    setActiveChoice(null)
    setPlayerCombo([])
    setBonusMessage('')
    setReconnecting(false)
    setSceneChoices({ left: 'idle', right: 'idle' })
  }

  const handleRematch = (accept) => {
    if (!socketRef.current) return
    socketRef.current.emit('rematch', { gameId: currentGameId, choice: accept })
    if (accept) { setRematchAsked(true); setWaitingRematch(true) }
    else { setGameOver(false); setWinner(null); setGameId('') }
  }

  if (!mounted) {
	return <main className="min-h-screen w-full bg-beige" />
  }

  // Calculated shorthand bindings
  const myName = amIPlayer1 ? player1 : player2
  const opponentName = amIPlayer1 ? player2 : player1
  const myScore = amIPlayer1 ? score1 : score2
  const opponentScore = amIPlayer1 ? score2 : score1






  // ==================================================================================
  // SCREEN CONTROLLER LAYER A: END-OF-GAME SUMMARY SCREEN
  // ==================================================================================

  if (gameOver) {
  const finalWon = (winner === 'player1' && amIPlayer1) || (winner === 'player2' && !amIPlayer1)
  return ( 
    <main className="min-h-screen flex items-center justify-center p-lg"
      style={{ background: 'linear-gradient(135deg, var(--pink) 0%, var(--orange) 100%)' }}>
      <div className="card w-full max-w-[500px] text-center">
        <div className="text-6xl mb-md">{finalWon ? '🏆' : '💀'}</div>
        <h1 className="press-start-title mb-md"
          style={{ color: finalWon ? 'var(--orange)' : 'var(--dark)', fontSize: 'var(--text-xl)' }}>
          {finalWon ? "You won !!" : "You lost..."}
        </h1>
        <div className="flex justify-center gap-xl mb-lg">
          <div>
            <p className="m-0 text-sm text-dark">{myName}</p>
            <p className="m-0 font-black text-4xl" style={{ color: '#f43f5e' }}>{myScore}</p>
          </div>
          <div>
            <p className="m-0 text-sm text-dark">{opponentName}</p>
            <p className="m-0 font-black text-4xl text-orange">{opponentScore}</p>
          </div>
        </div>
        {!rematchAsked ? (
          <div className="flex gap-sm justify-center flex-wrap">
            <button className="btn_orange w-auto px-lg" onClick={() => handleRematch(true)}>
              Play Again
            </button>
            <button className="btn_pink w-auto px-lg" onClick={() => handleRematch(false)}>
              Quit
            </button>
          </div>
        ) : (
          <p className="text-dark text-sm">⏳ Waiting for opponent...</p>
        )}
      </div>
    </main>
  )
}

  // ==================================================================================
  // SCREEN CONTROLLER LAYER B : GAME
  // ==================================================================================

if (inGame && levelSync) {
  const isRoundDraw = lastResult === 'draw'
  const iWonRound = (!isRoundDraw && lastResult === 'player1' && amIPlayer1) || (lastResult === 'player2' && !amIPlayer1)
  const hasGameEnded = winner !== null
  const amIWinner = hasGameEnded && ((winner === 'player1' && amIPlayer1) || (winner === 'player2' && !amIPlayer1))

  return (
<div className="relative overflow-hidden text-white  h-full w-full bg-transparent ">
			<GameWrapper> 
      {/* 1. THREE.JS SCENE */}
      <div className="absolute inset-0 w-full h-full">
        <GameScene
          className="w-full h-full"
          playerChoices={sceneChoices}
          animationRequestId={animationRequestId}
          onPlayerFinished={() => {}}
        />
      </div>

      {/* 2. HUD OVERLAY */}
      <div className="absolute inset-0 p-4 sm:p-6 flex flex-col justify-between pointer-events-none z-10">

        {/* ── TOP ROW : 3 Colonnes Alignées ── */}
        <div className="flex flex-row justify-between items-start w-full gap-4">

          {/* GAUCHE : Bouton Quitter + Combo */}
			<div className="flex flex-col gap-2 sm:gap-3 items-start w-1/4">
			<button
				type="button"
				onClick={handleLeaveGame}
				className="
				pointer-events-auto rounded-full border border-white/30 bg-black/40 backdrop-blur-sm 
				
				/* Tailles et Paddings adaptatifs selon l'écran */
				px-3 py-1 
				sm:px-4 sm:py-1.5 
				lg:px-5 lg:py-2 
				text-[10px] sm:text-xs lg:text-sm 
				
				font-semibold uppercase tracking-widest text-white/85 transition-all duration-200 
				hover:bg-orange-600 hover:border-orange-600 hover:text-white active:scale-95 shadow-md
				"
			>
				Leave Room
			</button>
            {(level >= 1) && playerCombo.length > 0 && !hasGameEnded && (
              <div className="pointer-events-auto p-2 rounded-xl bg-black/40 backdrop-blur-sm border border-white/5 inline-block text-[10px] sm:text-xs lg:text-sm text-stone-400 font-medium tracking-wide max-w-full">
                Combo: {' '}
                <span className="text-rose-400 font-mono font-bold uppercase drop-shadow-[0_0_6px_rgba(244,63,94,0.3)]">
                  {playerCombo.map(c => choiceLabels[c]).join(' ➔ ')}
                </span>
              </div>
            )}
          </div>

          {/* CENTRE : Score + Verdicts + Messages en colonne rectiligne */}
          <div className="flex flex-col items-center gap-3 flex-1">
            
            {/* Borne centrale de score */}
            <div className="pointer-events-auto flex flex-col items-center justify-center bg-black/60 backdrop-blur-md px-6 sm:px-8 py-3 sm:py-4 rounded-3xl border border-white/10 shadow-2xl min-w-[200px] sm:min-w-[240px] lg:min-w-[320px]">
              <span className="text-[14px] lg:text-xl uppercase tracking-widest text-white/40 font-bold mb-1">
                Score
              </span>

              <span className="text-[11px] sm:text-xs md:text-sm lg:text-base text-white/40 mb-2 text-center tracking-wide">
				<span className="text-rose-400 font-extrabold drop-shadow-[0_0_6px_rgba(244,63,94,0.2)]">{myName}</span>
				{' vs '}
				<span className="text-orange-400/90 font-extrabold drop-shadow-[0_0_6px_rgba(249,115,22,0.15)]">{opponentName}</span>
			  </span>

              <div className="text-3xl sm:text-4xl lg:text-5xl font-black font-mono tracking-wider flex items-center gap-4">
                <span className="text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.4)]">{myScore}</span>
                <span className="text-white/20 text-xl sm:text-2xl lg:text-3xl font-normal">-</span>
                <span className="text-orange-500/70">{opponentScore}</span>
              </div>

              {/* Choix du round */}
              {lastResult && !waiting && !hasGameEnded && (
                <div className="w-full grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-white/5 text-center text-xs lg:text-sm font-semibold uppercase tracking-wider">
                  <div className="text-rose-400/90">{choiceLabels[sceneChoices.left]}</div>
                  <div className="text-orange-400/60">{choiceLabels[sceneChoices.right]}</div>
                </div>
              )}

              {/* Verdict du round */}
              {lastResult && !waiting && !hasGameEnded && (
                <div className="mt-2 text-sm lg:text-base font-black uppercase tracking-widest">
                  <span className={
                    isRoundDraw ? 'text-stone-400' :
                    iWonRound ? 'text-rose-500 drop-shadow-[0_0_10px_rgba(244,63,94,0.6)]' :
                    'text-orange-500 drop-shadow-[0_0_10px_rgba(249,115,22,0.5)]'
                  }>
                    {isRoundDraw ? 'Tie' : iWonRound ? 'Won !' : 'Lost...'}
                  </span>
                </div>
              )}
            </div>

            {/* Messages transitoires et bannières de fin (w-max + non-coupé) */}
            {hasGameEnded && amIWinner && (
              <div className="pointer-events-auto text-center text-xl md:text-2xl lg:text-3xl font-black text-rose-500 drop-shadow-[0_0_12px_rgba(244,63,94,0.8)] tracking-wide animate-bounce mx-auto">
                You wonnnnn championnnnn !!!
              </div>
            )}
            
            {hasGameEnded && !amIWinner && (
              <div className="pointer-events-auto text-center text-xl md:text-2xl lg:text-3xl font-black text-orange-500 drop-shadow-[0_0_12px_rgba(249,115,22,0.8)] tracking-wide animate-bounce mx-auto">
                You lost... Like a loser !
              </div>
            )}

            {bonusMessage && !hasGameEnded && (
              <div className="pointer-events-auto text-center text-xs sm:text-sm lg:text-base font-bold bg-amber-500/80 text-black px-5 py-1.5 lg:px-7 lg:py-2 rounded-full border border-amber-400/50 shadow-[0_0_15px_rgba(245,158,11,0.4)] lg:shadow-[0_0_22px_rgba(245,158,11,0.6)] tracking-wide animate-pulse w-max max-w-[90vw] whitespace-nowrap">
                {bonusMessage}
              </div>
            )}

			{reconnecting && (
			<div className="pointer-events-auto text-center text-[10px] sm:text-xs md:text-sm lg:text-base font-bold bg-amber-500/90 text-black px-4 py-1.5 sm:px-6 sm:py-2 rounded-full border border-amber-400/50 shadow-lg lg:shadow-2xl animate-pulse w-max max-w-[90vw] whitespace-nowrap">
				⏳ Opponent disconnected — Waiting (30s max)
			</div>
			)}

			{waiting && !reconnecting && (
			<div className="pointer-events-auto text-center text-[10px] sm:text-xs md:text-sm lg:text-base bg-black/60 backdrop-blur-md border border-white/5 text-white/80 px-4 py-1.5 sm:px-6 sm:py-2 rounded-full font-semibold tracking-wide w-max max-w-[90vw] whitespace-nowrap shadow-md">
				⏳ Waiting for opponent's choice...
			</div>
			)}
          </div>

          {/* DROITE : Règles du jeu adaptées */}
          <div className="pointer-events-auto p-4 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 shadow-2xl text-right w-1/4 min-w-[140px]">
            <h1 className="font-bold text-base sm:text-xl lg:text-2xl text-stone-200 mb-1 tracking-wide">
              Multiplayer
            </h1>
            <p className="text-[11px] sm:text-xs lg:text-sm text-amber-400 font-bold uppercase tracking-wider mb-1">
              Level {level} — First to {maxScore} pts
            </p>
            <div className="border-t border-white/10 my-1" />
            <p className="text-[11px] sm:text-xs lg:text-sm text-stone-300 leading-relaxed font-medium">
              {levelRules[level]}
            </p>
          </div>

        </div>

        {/* ── BOTTOM ROW : Boutons d'actions réalignés en bas ── */}
        <div className="flex justify-center items-end w-full mt-auto mb-2">
          <div className="pointer-events-auto w-full flex justify-center">
            {!winner && (
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
                {level >= 2 && (
                  <WellButton 
                    onClick={() => handleChoice('well')}
                    className={`transform active:scale-95 transition-transform ${activeChoice === 'well' ? '!scale-110' : activeChoice ? 'opacity-40 pointer-events-none' : ''}`} 
                  />
                )}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ── SKIP BUTTON (Absolu bas-droite) ── */}
      {isCelebrating && (
        <div className="pointer-events-none absolute bottom-4 right-4 sm:bottom-6 sm:right-6 lg:bottom-8 lg:right-8 z-20">
          <button
            type="button"
            onClick={handleSkipAnimation}
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

  // ==================================================================================
  // SCREEN CONTROLLER LAYER C: PRE-GAME SELECTION LOBBY SCREEN (Default State)
  // ==================================================================================
  
 return (
  <main className="min-h-screen w-full flex flex-col items-center justify-start p-4 sm:p-6 lg:p-10 box-border bg-beige transition-all duration-200">

    {/* TITRE MULTIJOUEUR */}
    <h1 className="press-start-title text-orange text-center mb-2 sm:mb-4"
      style={{ fontSize: 'clamp(1.6rem, 4vw, 2.8rem)' }}>
      Multiplayer
    </h1>

    {/* STATUT DE CONNEXION */}
    <p className="text-orange font-bold mb-6 sm:mb-8 text-xs sm:text-sm md:text-base tracking-wide">
      {connected ? `🟢 Connected: ${myUsername || '...'}` : '🔴 Disconnected'}
    </p>

    {/* MESSAGE D'ERREUR RESPONSIVE */}
    {errorMsg && (
      <div className="mb-4 px-4 py-2 sm:px-6 sm:py-3 bg-orange text-red-700 rounded-[22px] font-bold w-full max-w-[440px] md:max-w-[540px] text-xs sm:text-sm md:text-base text-center shadow-md animate-shake">
        ⚠️ {errorMsg}
      </div>
    )}

    {/* CARTE PRINCIPALE DU LOBBY (Plus généreuse sur grand écran) */}
    <div className="w-full max-w-[440px] md:max-w-[540px] flex flex-col gap-6 sm:gap-8 bg-pink rounded-[32px] p-6 sm:p-8 lg:p-10 transition-all duration-200"
      style={{ border: '1px solid rgba(240,86,58,0.22)', boxShadow: '0 16px 36px rgba(240,86,58,0.12)' }}>

      {/* Level */}
      <div>
        <label htmlFor="level-select" className="block font-bold text-orange text-xs sm:text-sm md:text-base">Level</label>
        <select
          id="level-select"
          name="level"
          autoComplete="off"
          value={level}
          onChange={(e) => {
            const newLevel = Number(e.target.value);
            setLevel(newLevel);
            localStorage.setItem('selected_game_level', newLevel.toString());
          }}
          className="input-box w-full text-xs sm:text-sm md:text-base p-2 sm:p-3 bg-white"
          style={{ borderRadius: 20 }}
        >
          <option value={0}>Level 0 — Classic RPS (5 pts)</option>
          <option value={1}>Level 1 — Combo Bonus (10 pts)</option>
          <option value={2}>Level 2 — Well Added (10 pts)</option>
          <option value={3}>Level 3 — Giga Bonus (10 pts)</option>
        </select>
      </div>

      {/* CRÉER UNE ROOM */}
      <div className="flex flex-col gap-3 sm:gap-4">
        <button
          onClick={handleCreateRoom}
          disabled={!connected}
          className="btn_orange text-xs sm:text-sm md:text-base py-2.5 sm:py-3.5 active:scale-95 transition-transform"
        >
          Create a room
        </button>

        {gameId && (
          <div className="px-4 py-4 sm:px-6 sm:py-6 rounded-[24px] text-center shadow-inner transition-all duration-300 animate-fadeIn"
            style={{ background: 'var(--beige)', border: '1px solid rgba(240,86,58,0.2)' }}>
            <p className="m-0 text-[10px] sm:text-xs md:text-sm text-dark mb-1 sm:mb-2 font-medium">Room Code to share</p>
            <p className="m-0 font-black text-orange tracking-[4px] sm:tracking-[6px] text-3xl sm:text-4xl md:text-5xl select-all">{gameId}</p>
            <p className="mt-2 sm:mt-3 m-0 text-[10px] sm:text-xs md:text-sm text-dark font-medium animate-pulse">⏳ Waiting for an opponent...</p>
          </div>
        )}
      </div>

      {/* Join room */}
      <div>
        <label htmlFor="join-room" className="block font-bold text-orange text-xs sm:text-sm md:text-base">Join a room</label>
        <div className="flex gap-2 sm:gap-3">
          <InputBox
            id="join-room"
            name="roomCode"
            autoComplete="off"
            type="text"
            value={joinInput}
            onChange={(e) => setJoinInput(e.target.value)}
            placeholder="Room Code (e.g., a3f8c2)"
            className="input-box flex-1 text-xs sm:text-sm md:text-base p-2 sm:p-3"
            style={{ borderRadius: 20 }}
          />
          <button
            onClick={handleJoinRoom}
            disabled={!connected || !joinInput}
            className="btn_orange w-auto px-4 sm:px-6 text-xs sm:text-sm md:text-base active:scale-95 transition-transform"
          >
            Join
          </button>
        </div>
      </div>

    </div>
  </main>
);
}