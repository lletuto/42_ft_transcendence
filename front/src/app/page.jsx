'use client'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="relative flex items-center justify-center w-[500px] h-[500px]">

        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 500 500"
          style={{ animation: 'spin 20s linear infinite', transformOrigin: 'center' }}>
          <defs>
            <path id="arcCircle" d="M 250,250 m -185,0 a 185,185 0 1,1 370,0 a 185,185 0 1,1 -370,0" />
          </defs>

          <text
            fontSize="60"
            fill='var(--orange)'
            letterSpacing="8"
            fontFamily="'Jersey 15', sans-serif"
          >
            <textPath
              href="#arcCircle"
              startOffset="0%"
              textLength="1080"
              lengthAdjust="spacing"
              wordSpacing="70"
            >
              SCISSORS • ROCK • PAPER
            </textPath>
            <textPath
              href="#arcCircle"
              startOffset="93%"
            >
              •
            </textPath>
          </text>

        </svg>

        <div className="flex flex-col gap-4 z-10">
          <button
            onClick={() => router.push('/register')}
            className="btn_orange animate-float-2 var(--btn-lg)"
            style={{
              fontSize: 'clamp(1.25rem, 2vw, 1.75rem)',
              padding: 'clamp(0.5rem, 1vw, 1rem) clamp(1.5rem, 9vw, 3rem)',
            }}>
            Register
          </button>
          <button
            onClick={() => router.push('/login')}
            className="btn_orange animate-float-2 w-full"
            style={{
              fontSize: 'clamp(1.25rem, 2vw, 1.75rem)',
              padding: 'clamp(0.5rem, 1vw, 1rem) clamp(1.5rem, 9vw, 3rem)',
            }}>

            Log in
          </button>
        </div>

      </div>
    </div>
  )
} 