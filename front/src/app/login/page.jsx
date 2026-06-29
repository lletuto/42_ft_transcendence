"use client";
import { useState } from 'react'
import { useRouter } from 'next/navigation' //allws navigation without refreshing the page
import dynamic from 'next/dynamic'
import InputBox from '@/components/InputBox'

const BobbyModel = dynamic(() => import('@/components/BobbyModelLogin'), { ssr: false });

export default function Login() {
  //storing form datas input then error messages
  const [formData, setFormData] = useState({ email_nickname: "", password: "" });
  const [error, setError] = useState({ email_nickname: "", password: "" });
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);
  const [twoFaCode, setTwoFaCode] = useState("");
  const [twoFaError, setTwoFaError] = useState("");
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  //e is an InputEvent, we get the name and value of the input and update the formData state accordingly
  //it is triggered on every change in the input field, it contains e.target which is pointing to the HTML element where name and value are stored
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  //submits the login form and handles the response, including 2FA requirement
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const text = await response.text();
      const data = text ? JSON.parse(text) : {};

      if (!response.ok) {
        const messages = Array.isArray(data.message) ? data.message : [data.message || "Une erreur est survenue"];
        setError({ password: "", email_nickname: "" });
        messages.forEach(msg => {
          const m = msg.toLowerCase();
          if (m.includes("password")) setError(prev => ({ ...prev, password: msg }));
          else setError(prev => ({ ...prev, email_nickname: msg }));
        });
        return;
      }
      if (data.twoFactorRequired) {
        setTwoFactorRequired(true);  // ← shows the 2fa input form
        return;
      }
      setIsRedirecting(true);
      router.push("/jeu");
      router.refresh();
    } catch {
      setError(prev => ({ ...prev, email_nickname: "Network error. Check the console for more details." }));
    }
  };
  //deals with the 2fa code submission
  const handleTwoFa = async (e) => {
    e.preventDefault();
    setTwoFaError("");
    try {
      const res = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: twoFaCode }),
      });
      if (!res.ok) {
        setTwoFaError("Invalid code. Please try again.");
        return;
      }
      router.push("/jeu");
      router.refresh();
    } catch {
      setTwoFaError("Network error.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen -mt-20">
      {!isRedirecting && <BobbyModel />}
      <div className="-mt-16 w-full px-sm" style={{ maxWidth: 'min(500px, 90vw)' }}>
        {!twoFactorRequired ? (
          <form onSubmit={handleSubmit} method="POST" className="w-full flex flex-col gap-lg">
            <InputBox
              id="email_nickname"
              type="text"
              name="email_nickname"
              value={formData.email_nickname}
              onChange={handleChange}
              placeholder="Username or email"
              error={error.email_nickname}
            />
            <InputBox
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              error={error.password}
            />
            <button className="btn_orange animate-float-3">
              Login
            </button>
            <div className="flex gap-xs justify-center text-sm text-orange">
              <span>Don't have an account?</span>
              <button type="button" onClick={() => router.push('/register')} className="underline hover:opacity-70">
                Register here
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleTwoFa} className="w-full">
            <div className="flex flex-col gap-lg">
              <p className="text-orange text-sm">
                Enter the Google Authenticator code :
              </p>
              <div className="relative">
                <input
                  id="twoFaCode"
                  type="text"
                  value={twoFaCode}
                  onChange={(e) => setTwoFaCode(e.target.value)}
                  placeholder="6-digit code"
                  maxLength={6}
                  inputMode="numeric"
                  className="input-box"
                />
                {twoFaError && (
                  <p className="absolute -bottom-4 left-0 text-orange text-xs whitespace-nowrap">
                    {twoFaError}
                  </p>
                )}
              </div>
              <button type="submit" className="btn_orange animate-float-3">
                Confirm
              </button>
              <button type="button" onClick={() => setTwoFactorRequired(false)} className="text-orange underline text-sm">
                Back to login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}