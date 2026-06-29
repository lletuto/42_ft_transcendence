"use client";

import { useRouter } from "next/navigation";

export default function TermsOfService() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#ff9db1] to-[#f0563a] px-6 py-12 flex items-center justify-center text-[#f0563a]">

      <div className="w-full max-w-3xl bg-[#fad3a8] rounded-2xl shadow-xl p-8 md:p-12">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">
            Terms of Service
          </h1>

          <button
            onClick={() => router.back()}
            className="px-4 py-2 rounded-xl bg-[#f0563a] text-[#fad3a8] font-semibold hover:opacity-90 transition"
          >
            Go back
          </button>
        </div>

        <section className="space-y-8 leading-relaxed">

          <p className="text-lg">
            By using this application, you agree to these Terms of Service.
          </p>

          <div>
            <h2 className="text-2xl font-semibold mb-2">
              Use of the service
            </h2>
            <p>
              This application provides an online gaming experience.
              Users agree to use the service responsibly and respect other
              players.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-2">
              User accounts
            </h2>
            <p>
              Users are responsible for maintaining the security of their
              account credentials and for activity performed through their
              account.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-2">
              Prohibited behaviour
            </h2>
            <p>
              Users must not attempt to cheat, exploit bugs, disrupt the
              service, or access restricted areas of the application.
            </p>
            <p>
              Users must use the chat service responsibly and must not send spam, abusive,
              offensive, or inappropriate messages.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-2">
              Availability
            </h2>
            <p>
              We may modify or temporarily suspend the service for maintenance
              or improvements.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-2">
              Termination
            </h2>
          </div>

        </section>
      </div>
    </main>
  );
}

