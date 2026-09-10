"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  Archive,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Inbox,
  Loader2,
  Mail,
  MailCheck,
  RefreshCw,
  Reply,
  Trash2,
} from "lucide-react";

type MessageStatus =
  | "new"
  | "read"
  | "replied"
  | "archived";

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: MessageStatus;
  created_at: string;
};

const statusLabels: Record<
  MessageStatus,
  string
> = {
  new: "Yeni",
  read: "Okundu",
  replied: "Cevaplandı",
  archived: "Arşivlendi",
};

const statusClasses: Record<
  MessageStatus,
  string
> = {
  new:
    "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
  read:
    "border-zinc-700 bg-zinc-800/60 text-zinc-300",
  replied:
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  archived:
    "border-amber-500/30 bg-amber-500/10 text-amber-300",
};

function formatDate(
  value: string
) {
  try {
    return new Intl.DateTimeFormat(
      "tr-TR",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    ).format(
      new Date(value)
    );
  } catch {
    return value;
  }
}

export default function MessagesPage() {
  const [
    messages,
    setMessages,
  ] =
    useState<ContactMessage[]>([]);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    actionId,
    setActionId,
  ] =
    useState<string | null>(null);

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    filter,
    setFilter,
  ] =
    useState<
      "all" | MessageStatus
    >("all");

  const [
    selected,
    setSelected,
  ] =
    useState<ContactMessage | null>(
      null
    );

  const loadMessages =
    async () => {
      setLoading(true);
      setError("");

      try {
        const response =
          await fetch(
            "/api/admin/messages",
            {
              cache: "no-store",
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
              "Mesajlar yüklenemedi."
          );
        }

        setMessages(
          result.messages || []
        );

        setSelected(
          (current) => {
            if (!current) {
              return null;
            }

            return (
              (
                result.messages ||
                []
              ).find(
                (
                  item: ContactMessage
                ) =>
                  item.id ===
                  current.id
              ) || null
            );
          }
        );
      } catch (
        err: any
      ) {
        setError(
          err?.message ||
            "Mesajlar yüklenemedi."
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadMessages();
  }, []);

  const stats =
    useMemo(() => {
      return {
        total:
          messages.length,
        new:
          messages.filter(
            (item) =>
              item.status ===
              "new"
          ).length,
        replied:
          messages.filter(
            (item) =>
              item.status ===
              "replied"
          ).length,
      };
    }, [messages]);

  const filteredMessages =
    useMemo(() => {
      if (
        filter === "all"
      ) {
        return messages;
      }

      return messages.filter(
        (item) =>
          item.status ===
          filter
      );
    }, [
      messages,
      filter,
    ]);

  const updateStatus =
    async (
      item: ContactMessage,
      status: MessageStatus
    ) => {
      setActionId(item.id);
      setError("");

      try {
        const response =
          await fetch(
            "/api/admin/messages",
            {
              method:
                "PATCH",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body:
                JSON.stringify({
                  id: item.id,
                  status,
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
              "Mesaj güncellenemedi."
          );
        }

        const updated =
          result.message as ContactMessage;

        setMessages(
          (current) =>
            current.map(
              (message) =>
                message.id ===
                updated.id
                  ? updated
                  : message
            )
        );

        setSelected(
          (current) =>
            current?.id ===
            updated.id
              ? updated
              : current
        );
      } catch (
        err: any
      ) {
        setError(
          err?.message ||
            "Mesaj güncellenemedi."
        );
      } finally {
        setActionId(null);
      }
    };

  const openMessage =
    async (
      item: ContactMessage
    ) => {
      setSelected(item);

      if (
        item.status === "new"
      ) {
        await updateStatus(
          item,
          "read"
        );
      }
    };

  const deleteMessage =
    async (
      item: ContactMessage
    ) => {
      const approved =
        window.confirm(
          `"${item.subject}" mesajı kalıcı olarak silinsin mi?`
        );

      if (!approved) {
        return;
      }

      setActionId(item.id);
      setError("");

      try {
        const response =
          await fetch(
            `/api/admin/messages?id=${encodeURIComponent(
              item.id
            )}`,
            {
              method:
                "DELETE",
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
              "Mesaj silinemedi."
          );
        }

        setMessages(
          (current) =>
            current.filter(
              (message) =>
                message.id !==
                item.id
            )
        );

        setSelected(
          (current) =>
            current?.id ===
            item.id
              ? null
              : current
        );
      } catch (
        err: any
      ) {
        setError(
          err?.message ||
            "Mesaj silinemedi."
        );
      } finally {
        setActionId(null);
      }
    };

  const replyHref =
    selected
      ? `mailto:${selected.email}?subject=${encodeURIComponent(
          `Re: ${selected.subject}`
        )}`
      : "#";

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-[1180px] mx-auto px-4 sm:px-6 py-8 md:py-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Link
              href="/yonetim"
              className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-cyan-400 transition"
            >
              <ArrowLeft
                size={14}
              />
              Yönetim Paneli
            </Link>

            <div className="flex items-center gap-3 mt-4">
              <div className="w-11 h-11 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 flex items-center justify-center">
                <Inbox
                  size={20}
                  className="text-cyan-400"
                />
              </div>

              <div>
                <p className="text-[10px] font-black tracking-[0.18em] text-cyan-400 uppercase">
                  İLETİŞİM
                </p>

                <h1 className="text-2xl md:text-3xl font-black">
                  Gelen Mesajlar
                </h1>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={
              loadMessages
            }
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-xs font-bold text-zinc-300 hover:text-white hover:border-zinc-700 disabled:opacity-50"
          >
            <RefreshCw
              size={14}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />
            Yenile
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-7">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
            <Mail
              size={17}
              className="text-cyan-400"
            />
            <p className="text-2xl font-black mt-3">
              {stats.total}
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              Toplam mesaj
            </p>
          </div>

          <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4">
            <Clock3
              size={17}
              className="text-cyan-400"
            />
            <p className="text-2xl font-black mt-3">
              {stats.new}
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              Yeni mesaj
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
            <MailCheck
              size={17}
              className="text-emerald-400"
            />
            <p className="text-2xl font-black mt-3">
              {stats.replied}
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              Cevaplanan
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="flex gap-2 overflow-x-auto pb-1 mt-6">
          {(
            [
              [
                "all",
                "Tümü",
              ],
              [
                "new",
                "Yeni",
              ],
              [
                "read",
                "Okundu",
              ],
              [
                "replied",
                "Cevaplandı",
              ],
              [
                "archived",
                "Arşiv",
              ],
            ] as const
          ).map(
            ([
              value,
              label,
            ]) => (
              <button
                key={value}
                type="button"
                onClick={() =>
                  setFilter(
                    value
                  )
                }
                className={`shrink-0 rounded-xl border px-3.5 py-2 text-xs font-bold transition ${
                  filter ===
                  value
                    ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-300"
                    : "border-zinc-800 bg-zinc-900/50 text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {label}
              </button>
            )
          )}
        </div>

        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-5 mt-5">
          <section className="rounded-3xl border border-zinc-800 bg-zinc-900/30 overflow-hidden">
            {loading ? (
              <div className="min-h-[420px] flex items-center justify-center">
                <Loader2
                  size={24}
                  className="animate-spin text-cyan-400"
                />
              </div>
            ) : filteredMessages.length ===
              0 ? (
              <div className="min-h-[420px] flex flex-col items-center justify-center text-center px-6">
                <Inbox
                  size={32}
                  className="text-zinc-700"
                />
                <p className="text-sm font-bold text-zinc-400 mt-4">
                  Bu bölümde mesaj yok.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-800">
                {filteredMessages.map(
                  (item) => (
                    <button
                      type="button"
                      key={
                        item.id
                      }
                      onClick={() =>
                        openMessage(
                          item
                        )
                      }
                      className={`w-full text-left p-4 sm:p-5 transition hover:bg-zinc-900/70 ${
                        selected?.id ===
                        item.id
                          ? "bg-cyan-500/5"
                          : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p
                            className={`text-sm truncate ${
                              item.status ===
                              "new"
                                ? "font-black text-white"
                                : "font-bold text-zinc-300"
                            }`}
                          >
                            {
                              item.name
                            }
                          </p>

                          <p className="text-xs text-zinc-500 truncate mt-1">
                            {
                              item.subject
                            }
                          </p>
                        </div>

                        <span
                          className={`shrink-0 rounded-lg border px-2 py-1 text-[9px] font-black ${statusClasses[item.status]}`}
                        >
                          {
                            statusLabels[
                              item
                                .status
                            ]
                          }
                        </span>
                      </div>

                      <p className="text-[10px] text-zinc-600 mt-3">
                        {formatDate(
                          item.created_at
                        )}
                      </p>
                    </button>
                  )
                )}
              </div>
            )}
          </section>

          <section className="rounded-3xl border border-zinc-800 bg-zinc-900/50 min-h-[420px]">
            {!selected ? (
              <div className="h-full min-h-[420px] flex flex-col items-center justify-center text-center p-6">
                <Mail
                  size={32}
                  className="text-zinc-700"
                />
                <p className="text-sm font-bold text-zinc-400 mt-4">
                  Okumak için soldan bir mesaj seç.
                </p>
              </div>
            ) : (
              <div className="p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div>
                    <span
                      className={`inline-flex rounded-lg border px-2.5 py-1 text-[10px] font-black ${statusClasses[selected.status]}`}
                    >
                      {
                        statusLabels[
                          selected
                            .status
                        ]
                      }
                    </span>

                    <h2 className="text-xl font-black mt-3">
                      {
                        selected.subject
                      }
                    </h2>

                    <p className="text-sm font-bold text-zinc-300 mt-3">
                      {
                        selected.name
                      }
                    </p>

                    <a
                      href={`mailto:${selected.email}`}
                      className="text-xs text-cyan-400 hover:text-cyan-300 mt-1 inline-block break-all"
                    >
                      {
                        selected.email
                      }
                    </a>

                    <p className="text-[10px] text-zinc-600 mt-2">
                      {formatDate(
                        selected.created_at
                      )}
                    </p>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 sm:p-5">
                  <p className="whitespace-pre-wrap break-words text-sm leading-7 text-zinc-300">
                    {
                      selected.message
                    }
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 mt-5">
                  <a
                    href={
                      replyHref
                    }
                    onClick={() => {
                      if (
                        selected.status !==
                        "replied"
                      ) {
                        updateStatus(
                          selected,
                          "replied"
                        );
                      }
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-2.5 text-xs font-black text-zinc-950 hover:bg-cyan-300"
                  >
                    <Reply
                      size={14}
                    />
                    E-posta ile Cevapla
                  </a>

                  {selected.status !==
                    "replied" && (
                    <button
                      type="button"
                      onClick={() =>
                        updateStatus(
                          selected,
                          "replied"
                        )
                      }
                      disabled={
                        actionId ===
                        selected.id
                      }
                      className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-2.5 text-xs font-bold text-emerald-300 disabled:opacity-50"
                    >
                      <CheckCircle2
                        size={14}
                      />
                      Cevaplandı
                    </button>
                  )}

                  {selected.status !==
                    "archived" && (
                    <button
                      type="button"
                      onClick={() =>
                        updateStatus(
                          selected,
                          "archived"
                        )
                      }
                      disabled={
                        actionId ===
                        selected.id
                      }
                      className="inline-flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-2.5 text-xs font-bold text-amber-300 disabled:opacity-50"
                    >
                      <Archive
                        size={14}
                      />
                      Arşivle
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      deleteMessage(
                        selected
                      )
                    }
                    disabled={
                      actionId ===
                      selected.id
                    }
                    className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-2.5 text-xs font-bold text-red-300 disabled:opacity-50"
                  >
                    <Trash2
                      size={14}
                    />
                    Sil
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
