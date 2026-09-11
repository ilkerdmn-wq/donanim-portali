"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Home,
  Newspaper,
  Sparkles,
  Wrench,
  Layers,
  Mail,
  BookOpen,
  Search,
  Construction,
  LogOut,
  LayoutDashboard,
  Loader2,
  Menu,
  X,
} from "lucide-react";

import {
  SiteSettingsProvider,
  useSiteSettings,
} from "./SiteSettingsProvider";

function PortalShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const {
    settings,
    hydrated,
  } = useSiteSettings();

  const [isAdminAuthenticated, setIsAdminAuthenticated] =
    useState(false);

  const [authChecked, setAuthChecked] =
    useState(false);

  const [loggingOut, setLoggingOut] =
    useState(false);

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const adminTapCountRef = useRef(0);

  const adminTapTimerRef =
    useRef<ReturnType<typeof setTimeout> | null>(
      null
    );

  const isManagement =
    pathname.startsWith("/yonetim");

  const checkAdminSession =
    useCallback(async () => {
      try {
        const response = await fetch(
          "/api/admin/session",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const result =
          await response.json();

        setIsAdminAuthenticated(
          response.ok &&
            result.authenticated === true
        );
      } catch {
        setIsAdminAuthenticated(false);
      } finally {
        setAuthChecked(true);
      }
    }, []);

  useEffect(() => {
    checkAdminSession();
    setMobileMenuOpen(false);
  }, [
    pathname,
    checkAdminSession,
  ]);

  useEffect(() => {
    return () => {
      if (
        adminTapTimerRef.current
      ) {
        clearTimeout(
          adminTapTimerRef.current
        );
      }
    };
  }, []);

  const handleSecretAdminTap = () => {
    adminTapCountRef.current += 1;

    if (
      adminTapTimerRef.current
    ) {
      clearTimeout(
        adminTapTimerRef.current
      );
    }

    if (
      adminTapCountRef.current >= 5
    ) {
      adminTapCountRef.current = 0;

      window.location.href =
        isAdminAuthenticated
          ? "/yonetim"
          : "/yonetim/giris";

      return;
    }

    adminTapTimerRef.current =
      setTimeout(() => {
        adminTapCountRef.current = 0;
      }, 2500);
  };

  const handleLogout =
    async () => {
      if (loggingOut) {
        return;
      }

      setLoggingOut(true);

      try {
        await fetch(
          "/api/admin/logout",
          {
            method: "POST",
          }
        );
      } catch {
        // Cookie sunucu tarafında siliniyor.
      } finally {
        setIsAdminAuthenticated(
          false
        );

        setLoggingOut(false);

        window.location.href =
          "/yonetim/giris";
      }
    };

  if (
    hydrated &&
    settings.maintenanceMode &&
    !isManagement
  ) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center px-6">
        <div className="max-w-xl w-full rounded-3xl border border-amber-500/20 bg-zinc-900/70 p-8 text-center">
          <button
            type="button"
            onClick={
              handleSecretAdminTap
            }
            className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center"
            aria-label="Site durumu"
          >
            <Construction
              size={26}
              className="text-amber-400"
            />
          </button>

          <h1 className="text-3xl font-black mt-5">
            Bakım Modu
          </h1>

          <p className="text-sm text-zinc-400 mt-3 leading-6">
            {settings.siteName} şu
            anda kısa süreli bakımda.
            Lütfen daha sonra tekrar
            kontrol edin.
          </p>
        </div>
      </div>
    );
  }

  const publicLinks = [
    {
      href: "/",
      label: "Ana Sayfa",
      icon: Home,
    },
    {
      href: "/news",
      label: "Haberler",
      icon: Newspaper,
    },
    {
      href: "/araclar/pc-oneri",
      label: "Sistem Önerisi",
      icon: Sparkles,
    },
    {
      href: "/araclar",
      label: "Araçlar",
      icon: Wrench,
    },
    {
      href: "/donanim",
      label: "Donanım",
      icon: Layers,
    },
    {
      href: "/rehber",
      label: "Rehber",
      icon: BookOpen,
    },
    {
      href: "/arama",
      label: "Ara",
      icon: Search,
    },
    {
      href: "/iletisim",
      label: "İletişim",
      icon: Mail,
    },
  ];

  const isActiveLink = (
    href: string
  ) => {
    if (href === "/") {
      return pathname === "/";
    }

    if (
      href ===
      "/araclar/pc-oneri"
    ) {
      return pathname.startsWith(
        "/araclar/pc-oneri"
      );
    }

    if (
      href === "/araclar"
    ) {
      return (
        pathname.startsWith(
          "/araclar"
        ) &&
        !pathname.startsWith(
          "/araclar/pc-oneri"
        )
      );
    }

    return pathname.startsWith(
      href
    );
  };

  return (
    <>
      <header className="border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={
                handleSecretAdminTap
              }
              className="w-10 h-10 rounded-full overflow-hidden border border-cyan-500/30 bg-zinc-950 shadow-lg shadow-cyan-500/20 hover:scale-105 transition-transform"
              aria-label="Donanım Portalı"
            >
              <Image
                src="/donanim-portali-logo.png"
                alt="Donanım Portalı"
                width={40}
                height={40}
                priority
                className="w-full h-full object-cover"
              />
            </button>

            <Link
              href="/"
              className="flex flex-col min-w-0"
            >
              <span className="text-sm font-extrabold tracking-wider text-white truncate">
                {settings.siteName.toLocaleUpperCase(
                  "tr-TR"
                )}
              </span>

              <span className="text-[9px] text-zinc-400 font-semibold tracking-widest uppercase truncate">
                {
                  settings.siteSlogan
                }
              </span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-1 bg-zinc-900/50 border border-zinc-800/80 px-3 py-1.5 rounded-2xl">
            {publicLinks.map(
              (item) => {
                const Icon =
                  item.icon;

                const active =
                  isActiveLink(
                    item.href
                  );

                return (
                  <Link
                    key={
                      item.href
                    }
                    href={
                      item.href
                    }
                    className={
                      active
                        ? "px-3.5 py-1.5 rounded-xl text-xs font-bold text-cyan-400 bg-cyan-950/40 border border-cyan-900/50 transition-all flex items-center gap-1.5 shadow-sm"
                        : "px-3.5 py-1.5 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition-all flex items-center gap-1.5"
                    }
                  >
                    <Icon
                      size={
                        14
                      }
                    />

                    {
                      item.label
                    }
                  </Link>
                );
              }
            )}
          </nav>

          <div className="flex items-center gap-2">
            {isManagement &&
              authChecked &&
              isAdminAuthenticated && (
                <div className="hidden md:flex items-center gap-2">
                  <Link
                    href="/yonetim"
                    className="px-4 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/15 border border-cyan-500/20 text-xs font-bold text-cyan-400 transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <LayoutDashboard
                      size={14}
                    />
                    Panel
                  </Link>

                  <button
                    type="button"
                    onClick={
                      handleLogout
                    }
                    disabled={
                      loggingOut
                    }
                    className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-red-500/10 border border-zinc-800 hover:border-red-500/20 text-xs font-bold text-zinc-400 hover:text-red-400 disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    {loggingOut ? (
                      <Loader2
                        size={
                          14
                        }
                        className="animate-spin"
                      />
                    ) : (
                      <LogOut
                        size={
                          14
                        }
                      />
                    )}

                    Çıkış
                  </button>
                </div>
              )}

            <button
              type="button"
              onClick={() =>
                setMobileMenuOpen(
                  true
                )
              }
              className="md:hidden w-10 h-10 rounded-xl border border-zinc-800 bg-zinc-900/80 text-zinc-300 flex items-center justify-center hover:text-white hover:border-zinc-700 transition-colors"
              aria-label="Menüyü aç"
            >
              <Menu
                size={20}
              />
            </button>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          <button
            type="button"
            aria-label="Menüyü kapat"
            onClick={() =>
              setMobileMenuOpen(
                false
              )
            }
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          <aside className="absolute right-0 top-0 h-full w-[82%] max-w-[340px] bg-zinc-950 border-l border-zinc-800 shadow-2xl p-5">
            <div className="flex items-center justify-between pb-5 border-b border-zinc-800">
              <div>
                <p className="text-[10px] font-black tracking-[0.18em] text-cyan-400 uppercase">
                  MENÜ
                </p>

                <p className="text-sm font-extrabold text-white mt-1">
                  {
                    settings.siteName
                  }
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setMobileMenuOpen(
                    false
                  )
                }
                className="w-10 h-10 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 flex items-center justify-center"
                aria-label="Menüyü kapat"
              >
                <X
                  size={19}
                />
              </button>
            </div>

            <nav className="flex flex-col gap-2 mt-5">
              {publicLinks.map(
                (item) => {
                  const Icon =
                    item.icon;

                  const active =
                    isActiveLink(
                      item.href
                    );

                  return (
                    <Link
                      key={
                        item.href
                      }
                      href={
                        item.href
                      }
                      onClick={() =>
                        setMobileMenuOpen(
                          false
                        )
                      }
                      className={
                        active
                          ? "flex items-center gap-3 px-4 py-4 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 text-sm font-black text-cyan-300 transition-all"
                          : "flex items-center gap-3 px-4 py-4 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 text-sm font-bold text-zinc-300 hover:text-white hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all"
                      }
                    >
                      <Icon
                        size={
                          18
                        }
                        className={
                          active
                            ? "text-cyan-300"
                            : "text-cyan-400"
                        }
                      />

                      {
                        item.label
                      }
                    </Link>
                  );
                }
              )}
            </nav>

            {isManagement &&
              authChecked &&
              isAdminAuthenticated && (
                <div className="mt-6 pt-5 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={
                      handleLogout
                    }
                    disabled={
                      loggingOut
                    }
                    className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl border border-red-500/20 bg-red-500/5 text-sm font-bold text-red-400"
                  >
                    {loggingOut ? (
                      <Loader2
                        size={
                          16
                        }
                        className="animate-spin"
                      />
                    ) : (
                      <LogOut
                        size={
                          16
                        }
                      />
                    )}

                    Çıkış
                  </button>
                </div>
              )}
          </aside>
        </div>
      )}

      {hydrated &&
        settings.showAnnouncement &&
        settings.announcement.trim() && (
          <div className="border-b border-cyan-500/20 bg-cyan-500/10">
            <div className="max-w-[1400px] mx-auto px-6 py-2.5">
              <p className="text-xs text-cyan-100 text-center font-semibold">
                {
                  settings.announcement
                }
              </p>
            </div>
          </div>
        )}

      <main className="flex-1">
        {children}
      </main>
    </>
  );
}

export default function SiteShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SiteSettingsProvider>
      <PortalShell>
        {children}
      </PortalShell>
    </SiteSettingsProvider>
  );
}