"use client";

import { useRouter } from "next/navigation";

export default function PrivacyPolicy() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#ff9db1] to-[#f0563a] px-6 py-12 flex items-center justify-center text-[#f0563a]">

      <div className="w-full max-w-3xl bg-[#fad3a8] rounded-2xl shadow-xl p-8 md:p-12">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">
            Privacy Policy
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
            This Privacy Policy explains how our application collects,
            uses, and protects user information.
          </p>

          <div>
            <h2 className="text-2xl font-semibold mb-2">
              Information we collect
            </h2>
            <p>
              When you create an account, we may collect information such as
              your username, email address, profile information, and game
              activity data necessary to provide the service.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-2">
              How we use your information
            </h2>
            <p>
              We use collected information to provide and improve the game,
              authenticate users, maintain security, and offer the requested
              features.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-2">
              Data protection
            </h2>
            <p>
              We take reasonable measures to protect user data and prevent
              unauthorized access.
            </p>
          </div>



          <div>
            <h2 className="text-2xl font-semibold mb-2">
              Changes to this policy
            </h2>
            <p>
              This Privacy Policy may be updated when necessary. Continued
              use of the application means you accept the updated policy.
            </p>
          </div>

        </section>
      </div>
    </main>
  );
}

