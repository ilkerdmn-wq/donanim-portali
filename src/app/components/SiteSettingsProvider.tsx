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

export const SITE_SETTINGS_STORAGE_KEY =
  "donanim_portali_site_settings";

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
  updateSettings: (next: SiteSettings) => void;
  resetSettings: () => void;
  hydrated: boolean;
};

const SiteSettingsContext =
  createContext<SiteSettingsContextValue | null>(null);

export function SiteSettingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, setSettings] =
    useState<SiteSettings>(defaultSiteSettings);

  const [hydrated, setHydrated] =
    useState(false);

  useEffect(() => {
    try {
      const stored =
        window.localStorage.getItem(
          SITE_SETTINGS_STORAGE_KEY
        );

      if (stored) {
        const parsed =
          JSON.parse(stored) as Partial<SiteSettings>;

        setSettings({
          ...defaultSiteSettings,
          ...parsed,
        });
      }
    } catch (error) {
      console.error(
        "Site ayarları okunamadı:",
        error
      );
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    const onStorage = (
      event: StorageEvent
    ) => {
      if (
        event.key !==
          SITE_SETTINGS_STORAGE_KEY ||
        !event.newValue
      ) {
        return;
      }

      try {
        const parsed =
          JSON.parse(event.newValue) as Partial<SiteSettings>;

        setSettings({
          ...defaultSiteSettings,
          ...parsed,
        });
      } catch {
        // Geçersiz kayıt varsa mevcut ayarları koru.
      }
    };

    window.addEventListener(
      "storage",
      onStorage
    );

    return () =>
      window.removeEventListener(
        "storage",
        onStorage
      );
  }, []);

  const updateSettings = (
    next: SiteSettings
  ) => {
    setSettings(next);

    window.localStorage.setItem(
      SITE_SETTINGS_STORAGE_KEY,
      JSON.stringify(next)
    );

    window.dispatchEvent(
      new CustomEvent(
        "donanim-portali-settings-changed",
        {
          detail: next,
        }
      )
    );
  };

  const resetSettings = () => {
    updateSettings(
      defaultSiteSettings
    );
  };

  useEffect(() => {
    const onCustomChange = (
      event: Event
    ) => {
      const customEvent =
        event as CustomEvent<SiteSettings>;

      if (
        customEvent.detail
      ) {
        setSettings({
          ...defaultSiteSettings,
          ...customEvent.detail,
        });
      }
    };

    window.addEventListener(
      "donanim-portali-settings-changed",
      onCustomChange
    );

    return () =>
      window.removeEventListener(
        "donanim-portali-settings-changed",
        onCustomChange
      );
  }, []);

  const value = useMemo(
    () => ({
      settings,
      updateSettings,
      resetSettings,
      hydrated,
    }),
    [
      settings,
      hydrated,
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
