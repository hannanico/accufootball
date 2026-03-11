"use client";
import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

function ResetForm() {
  const t = useTranslations("resetPassword");
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/password/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    setLoading(false);
    if (res.ok) {
      router.push("/auth/signin?reset=success");
    } else {
      const data = await res.json();
      setError(data.error ?? t("genericError"));
    }
  }

  if (!token) {
    return <p className="text-center text-red-400 mt-20">{t("invalidLink")}</p>;
  }

  return (
    <div className="min-h-screen flex flex-col justify-center px-6">
      <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
      <p className="text-gray-400 mb-8">{t("subtitle")}</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-sm text-gray-400 mb-1 block">{t("passwordLabel")}</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder={t("passwordPlaceholder")} required minLength={6}
            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-400" />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button type="submit" disabled={loading}
          className="w-full bg-yellow-400 text-black font-bold py-3 rounded-xl mt-2 active:scale-95 transition-transform disabled:opacity-50">
          {loading ? t("updating") : t("updateButton")}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetForm />
    </Suspense>
  );
}
