'use client';
import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Level00 from './levels/Level00';
import Level01 from './levels/Level01';
import Level02 from './levels/Level02';
import Level03 from './levels/Level03';
import Lobby from './lobby';
import { Suspense } from 'react';
export const dynamic = "force-dynamic";
import { fetchWithRefresh } from '../lib/fetchWithRefresh';
export default function Jeupage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <JeuContent />
    </Suspense>
  );
}
function JeuContent() {

  const router = useRouter();
  const searchParams = useSearchParams();

  //Checks if the user is still authenticated every 10 seconds, and if not, it redirects to the login page. 
  useEffect(() => {

    const checkSession = async () => {

      // const response = await fetch(
      //   "/api/users/me",
      //   {
      //     credentials: "include",
      //   }
      // );
      const response = await fetchWithRefresh("/api/users/me");
      if (!response || !response.ok) {
          router.replace("/login");
      }
      // if (!response.ok) {

      //   router.replace("/login");
      // }
    };

    const interval = setInterval(
      checkSession,
      10000
    );
    checkSession();
    return () => clearInterval(interval);
  }, [router]);

  const mode = searchParams.get('mode');
  const niveauActuel = Number(searchParams.get('niveau')) || 0;


  const handleSetMode = (newMode) => {
    router.push(`/jeu?mode=${newMode}`);
  };



  const afficherNiveau = () => {
    switch (niveauActuel) {
      case 0: return <Level00 nextLevelPath="/jeu?mode=bot&niveau=1" homePath="/jeu" />;
      case 1: return <Level01 nextLevelPath="/jeu?mode=bot&niveau=2" homePath="/jeu" />;
      case 2: return <Level02 nextLevelPath="/jeu?mode=bot&niveau=3" homePath="/jeu" />;
      case 3: return <Level03 nextLevelPath="/jeu" homePath="/jeu" />;
      default: return <Level00 nextLevelPath="/jeu?mode=bot&niveau=1" homePath="/jeu" />;
    }
  };


if (!mode) {
  return (
    <div className="flex flex-col items-center justify-center  h-full bg-beige rounded-lg relative overflow-hidden px-md py-xl">
      <div className="relative flex flex-col items-center justify-center">
        
        {/*circle around the buttons*/}
        <svg
          width="420"
          height="420"
          viewBox="0 0 420 420"
          style={{
            position: 'absolute',
            top: '-25%',
            left: '-38%',
            transform: 'translate(-50%, -50%)',
            animation: 'spin 20s linear infinite',
            pointerEvents: 'none',
          }}
        >
          <defs>
            <path id="arcCircle" d="M 210,30 A 180,180 0 1,1 209.99,30" />
          </defs>
          <text style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '18px',
            fill: "var(--orange)",
            letterSpacing: '6px'
          }}>
            <textPath href="#arcCircle" startOffset="0%">
               CHOOSE A MODE
            </textPath>
          </text>
        </svg>

        {/*center buttons*/}
        <div className="flex flex-col items-center gap-lg z-10 py-xl">
          <button
            className="btn_orange animate-float-2"
            style={{
              fontSize: 'clamp(1.25rem, 2vw, 1.75rem)',
              padding: 'clamp(0.5rem, 3vw, 1rem) clamp(1.5rem, 9vw, 3rem)',
            }}
            onClick={() => handleSetMode('bot')}
            onMouseEnter={e => { e.currentTarget.style.background = "var(--pink)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "var(--orange)"; }}
          >
            Player vs Bot
          </button>
          <button
            className="btn_orange animate-float-2"
            style={{
              fontSize: 'clamp(1.25rem, 2vw, 1.75rem)',
              padding: 'clamp(0.5rem, 3vw, 1rem) clamp(1.5rem, 9vw, 3rem)',
            }}
            onClick={() => handleSetMode('multi')}
            onMouseEnter={e => { e.currentTarget.style.background = "var(--pink)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "var(--orange)"; }}
          >
            Multiplayer
          </button>
        </div>

      </div>
    </div>
  );
}

return (
 <div className="h-full rounded-lg p-md flex flex-col">
    <div className="my-md flex-1 min-h-0">
      {mode === 'multi' ? <Lobby /> : afficherNiveau()}
    </div>
  </div>
);
}