"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type SiteSettings = {
  siteName: string;
  siteSlogan: string;
  announcement: string;
  showAnnouncement: boolean;
  showPrices: boolean;
  showPriceSource: boolean;
  maintenanceMode: boolean;
};

export const defaultSiteSettings: SiteSettings = {
  siteName: "Donanım Portalı",
  siteSlogan: "Haber • Araç • Keşif",
  announcement: "",
  showAnnouncement: false,
  showPrices: true,
  showPriceSource: true,
  maintenanceMode: false,
};

type SiteSettingsContextValue = {
  settings: SiteSettings;
  updateSettings: (
    next: SiteSettings
  ) => Promise<void>;
  resetSettings: () => Promise<void>;
  hydrated: boolean;
  saving: boolean;
  loadError: string;
};

const SiteSettingsContext =
  createContext<SiteSettingsContextValue | null>(
    null
  );

export function SiteSettingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [
    settings,
    setSettings,
  ] =
    useState<SiteSettings>(
      defaultSiteSettings
    );

  const [
    hydrated,
    setHydrated,
  ] =
    useState(false);

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  const [
    loadError,
    setLoadError,
  ] =
    useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings =
    async () => {
      try {
        setLoadError("");

        const response =
          await fetch(
            "/api/site-settings",
            {
              method: "GET",
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
              "Site ayarları yüklenemedi."
          );
        }

        setSettings({
          ...defaultSiteSettings,
          ...result.settings,
        });
      } catch (error: any) {
        console.error(
          "Site ayarları yükleme hatası:",
          error
        );

        setLoadError(
          error?.message ||
            "Site ayarları yüklenemedi."
        );

        setSettings(
          defaultSiteSettings
        );
      } finally {
        setHydrated(true);
      }
    };

  const updateSettings =
    async (
      next: SiteSettings
    ) => {
      setSaving(true);

      try {
        const response =
          await fetch(
            "/api/site-settings",
            {
              method: "PUT",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body:
                JSON.stringify(
                  next
                ),
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
              "Site ayarları kaydedilemedi."
          );
        }

        setSettings({
          ...defaultSiteSettings,
          ...result.settings,
        });
      } finally {
        setSaving(false);
      }
    };

  const resetSettings =
    async () => {
      await updateSettings(
        defaultSiteSettings
      );
    };

  const value =
    useMemo(
      () => ({
        settings,
        updateSettings,
        resetSettings,
        hydrated,
        saving,
        loadError,
      }),
      [
        settings,
        hydrated,
        saving,
        loadError,
      ]
    );

  return (
    <SiteSettingsContext.Provider
      value={value}
    >
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  const context =
    useContext(
      SiteSettingsContext
    );

  if (!context) {
    throw new Error(
      "useSiteSettings, SiteSettingsProvider içinde kullanılmalıdır."
    );
  }

  return context;
}
