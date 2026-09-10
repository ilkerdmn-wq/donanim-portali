"use client";

import { FormEvent, useState } from "react";

import {
  CheckCircle2,
  Mail,
  MessageSquare,
  Send,
  ShieldCheck,
} from "lucide-react";

type FormState = {
  name: string;
  email: string;
  subject: string;
  message: string;
  website: string;
};

const initialForm: FormState = {
  name: "",
  email: "",
  subject: "",
  message: "",
  website: "",
};

export default function ContactForm() {
  const [form, setForm] =
    useState<FormState>(initialForm);

  const [sending, setSending] =
    useState(false);

  const [success, setSuccess] =
    useState(false);

  const [error, setError] =
    useState("");

  const updateField = (
    field: keyof FormState,
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (sending) {
      return;
    }

    setSending(true);
    setSuccess(false);
    setError("");

    try {
      const response = await fetch(
        "/api/contact",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Mesaj gönderilirken bir hata oluştu."
        );
      }

      setForm(initialForm);
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Mesaj gönderilirken bir hata oluştu."
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-zinc-950 text-zinc-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-8 lg:gap-10">
          <section className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6 sm:p-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1.5 text-xs font-bold text-cyan-400">
              <MessageSquare size={14} />
              İLETİŞİM
            </div>

            <h1 className="mt-5 text-3xl sm:text-4xl font-black tracking-tight text-white">
              Bize ulaşın
            </h1>

            <p className="mt-4 text-sm sm:text-base leading-7 text-zinc-400">
              Görüşlerinizi, önerilerinizi,
              hata bildirimlerinizi veya iş
              birliği taleplerinizi bu form
              üzerinden bize iletebilirsiniz.
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex gap-3 rounded-2xl border border-zinc-800 bg-zinc-950/50 p-4">
                <div className="w-10 h-10 shrink-0 rounded-xl border border-cyan-500/20 bg-cyan-500/10 flex items-center justify-center">
                  <Mail
                    size={18}
                    className="text-cyan-400"
                  />
                </div>

                <div>
                  <p className="text-sm font-bold text-white">
                    Mesaj bırakın
                  </p>

                  <p className="mt-1 text-xs leading-5 text-zinc-500">
                    Form üzerinden gönderilen
                    mesajlar güvenli şekilde
                    sistemimize kaydedilir.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 rounded-2xl border border-zinc-800 bg-zinc-950/50 p-4">
                <div className="w-10 h-10 shrink-0 rounded-xl border border-cyan-500/20 bg-cyan-500/10 flex items-center justify-center">
                  <ShieldCheck
                    size={18}
                    className="text-cyan-400"
                  />
                </div>

                <div>
                  <p className="text-sm font-bold text-white">
                    Gizlilik
                  </p>

                  <p className="mt-1 text-xs leading-5 text-zinc-500">
                    İletişim bilgilerinizi
                    yalnızca mesajınıza dönüş
                    yapmak amacıyla kullanırız.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-8 shadow-2xl shadow-black/20">
            <h2 className="text-xl font-black text-white">
              İletişim Formu
            </h2>

            <p className="mt-2 text-sm text-zinc-500">
              Aşağıdaki alanları doldurup
              mesajınızı gönderin.
            </p>

            {success && (
              <div className="mt-5 flex items-start gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-300">
                <CheckCircle2
                  size={18}
                  className="mt-0.5 shrink-0"
                />

                Mesajınız başarıyla gönderildi.
                Teşekkür ederiz.
              </div>
            )}

            {error && (
              <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
                {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="mt-6 space-y-5"
            >
              <div className="grid sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-xs font-bold text-zinc-300">
                    Ad Soyad
                  </span>

                  <input
                    type="text"
                    value={form.name}
                    onChange={(event) =>
                      updateField(
                        "name",
                        event.target.value
                      )
                    }
                    minLength={2}
                    maxLength={80}
                    required
                    autoComplete="name"
                    placeholder="Adınız"
                    className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10 placeholder:text-zinc-600"
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-bold text-zinc-300">
                    E-posta
                  </span>

                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      updateField(
                        "email",
                        event.target.value
                      )
                    }
                    maxLength={160}
                    required
                    autoComplete="email"
                    placeholder="ornek@mail.com"
                    className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10 placeholder:text-zinc-600"
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-xs font-bold text-zinc-300">
                  Konu
                </span>

                <input
                  type="text"
                  value={form.subject}
                  onChange={(event) =>
                    updateField(
                      "subject",
                      event.target.value
                    )
                  }
                  minLength={3}
                  maxLength={120}
                  required
                  placeholder="Mesajınızın konusu"
                  className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10 placeholder:text-zinc-600"
                />
              </label>

              <label className="block">
                <span className="text-xs font-bold text-zinc-300">
                  Mesaj
                </span>

                <textarea
                  value={form.message}
                  onChange={(event) =>
                    updateField(
                      "message",
                      event.target.value
                    )
                  }
                  minLength={10}
                  maxLength={3000}
                  required
                  rows={8}
                  placeholder="Mesajınızı buraya yazın..."
                  className="mt-2 w-full resize-y rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm leading-6 text-white outline-none transition focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10 placeholder:text-zinc-600"
                />
              </label>

              <input
                type="text"
                value={form.website}
                onChange={(event) =>
                  updateField(
                    "website",
                    event.target.value
                  )
                }
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="hidden"
              />

              <button
                type="submit"
                disabled={sending}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-6 py-3.5 text-sm font-black text-zinc-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Send size={17} />

                {sending
                  ? "Gönderiliyor..."
                  : "Mesajı Gönder"}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}