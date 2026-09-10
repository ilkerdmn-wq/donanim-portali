"use client";

import {
  FormEvent,
  useState,
} from "react";

import {
  KeyRound,
  Loader2,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

export default function AdminLoginPage() {
  const [
    password,
    setPassword,
  ] =
    useState("");

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");

  const handleSubmit =
    async (
      event: FormEvent
    ) => {
      event.preventDefault();

      if (
        !password.trim()
      ) {
        setError(
          "Şifreyi gir."
        );

        return;
      }

      setLoading(true);
      setError("");

      try {
        const response =
          await fetch(
            "/api/admin/login",
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body:
                JSON.stringify({
                  password,
                }),
            }
          );

        const result =
          await response.json();

        if (
          !response.ok ||
          !result.success
        ) {
          throw new Error(
            result.error ||
              "Giriş başarısız."
          );
        }

        window.location.href =
          "/yonetim";
      } catch (
        error: any
      ) {
        setError(
          error?.message ||
            "Giriş yapılamadı."
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-7 md:p-8 shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
            <ShieldCheck
              size={22}
              className="text-cyan-400"
            />
          </div>

          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-400 mt-6">
            YÖNETİM GİRİŞİ
          </p>

          <h1 className="text-3xl font-black tracking-tight mt-1">
            Admin Girişi
          </h1>

          <p className="text-sm text-zinc-500 mt-2 leading-6">
            Yönetim paneline erişmek için
            admin şifresini gir.
          </p>

          <form
            onSubmit={
              handleSubmit
            }
            className="mt-7 flex flex-col gap-4"
          >
            <div>
              <label className="text-xs font-bold text-zinc-400 flex items-center gap-2 mb-2">
                <KeyRound
                  size={14}
                  className="text-cyan-400"
                />
                Admin Şifresi
              </label>

              <div className="relative">
                <LockKeyhole
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
                />

                <input
                  type="password"
                  value={
                    password
                  }
                  onChange={(
                    e
                  ) =>
                    setPassword(
                      e.target.value
                    )
                  }
                  autoComplete="current-password"
                  placeholder="Şifrenizi girin"
                  className="w-full h-12 pl-11 pr-4 rounded-xl border border-zinc-800 bg-zinc-950 text-sm text-white outline-none focus:border-cyan-500/50"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-xs text-red-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={
                loading
              }
              className="h-12 rounded-xl bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 text-zinc-950 font-black text-sm flex items-center justify-center gap-2 transition-all"
            >
              {loading ? (
                <>
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                  Giriş yapılıyor...
                </>
              ) : (
                <>
                  <ShieldCheck
                    size={16}
                  />
                  Yönetim Paneline Gir
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-[10px] text-zinc-600 text-center mt-4">
          Oturum 8 saat boyunca açık kalır.
        </p>
      </div>
    </main>
  );
}
