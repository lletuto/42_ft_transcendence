// import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Chatbot from "@/components/Chatbot";
import { Press_Start_2P, Jersey_15 } from "next/font/google";

//The layout is the general layout of the app, it is used in all pages. It is a good place to put the header and footer.  
import PresenceSocket from "@/components/PresenceSocket";
import { preload } from "react-dom";

export const metadata = {
  title: "Transcendance",
  description: "Transcendance is an online Rock paper scissors game"
};

const pressStart = Press_Start_2P({
  weight: '400',
  variable: '--font-press-start',
  subsets: ['latin'],
  display: 'swap',
  preload: false,
});

const jersey15 = Jersey_15({
  weight: '400',
  variable: '--font-jersey',
  subsets: ['latin'],
  display: 'swap',
  preload: false,
});

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={` ${pressStart.variable} ${jersey15.variable} h-full antialiased`}
    >
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="min-h-screen flex flex-col">
        <PresenceSocket />

        {children}
        <Chatbot />
        <footer className="p-sm text-center text-[#fad3a8] " >

          <a
            href="/privacy-policy"
            className="mx-4 underline"
          >
            Privacy Policy
          </a>

          <a
            href="/terms-of-service"
            className="mx-4 underline"
          >
            Terms of Service
          </a>

        </footer>

      </body>
    </html>
  );
}

