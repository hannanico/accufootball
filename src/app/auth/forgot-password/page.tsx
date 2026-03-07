"use client";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/password/forgot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    setLoading(false);
    if (res.ok) {
      setSent(true);
    } else {
      const data = await res.json();
      setError(data.error ?? "Something went wrong.");
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen flex flex-col justify-center px-6 text-center">
        <div className="text-5xl mb-4">📬</div>
        <h1 className="text-2xl font-bold mb-2">Check your email</h1>
        <p className="text-gray-400">We sent a password reset link to <span className="text-white">{email}</span></p>
        <a href="/auth/signin" className="text-yellow-400 text-sm mt-6">Back to Sign In</a>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center px-6">
      <h1 className="text-3xl font-bold mb-2">Forgot password</h1>
      <p className="text-gray-400 mb-8">Enter your email and we'll send you a reset link</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-sm text-gray-400 mb-1 block">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com" required
            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-400" />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button type="submit" disabled={loading}
          className="w-full bg-yellow-400 text-black font-bold py-3 rounded-xl mt-2 active:scale-95 transition-transform disabled:opacity-50">
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>

      <a href="/auth/signin" className="text-center text-gray-500 text-sm mt-6">Back to Sign In</a>
    </div>
  );
}
