"use client";
import {
  BlogSettings,
  GeneralSettings,
  ContentSettings,
  NotificationSettings,
  AppearanceSettings,
} from "@/types/types";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

// Define types for each settings category
interface BlogSettingsContextProps {
  settings: BlogSettings;
  updateGeneralSettings: (updates: Partial<GeneralSettings>) => void;
  updateContentSettings: (updates: Partial<ContentSettings>) => void;
  updateAppearanceSettings: (updates: Partial<AppearanceSettings>) => void;
  updateNotificationSettings: (updates: Partial<NotificationSettings>) => void;
  saveChanges: () => Promise<boolean>;
  resetChanges: () => void;
  loading: boolean;
}

const defaultSettings: BlogSettings = {
  general: {
    siteTitle: "My Awesome Blog",
    metaDescription: "",
    faviconUrl: "",
    logoUrl: "",
    language: "en",
    timezone: "UTC",
  },
  content: {
    postsPerPage: 10,
    defaultCategory: "uncategorized",
    commentModeration: true,
    allowComments: true,
    excerptLength: 150,
  },
  appearance: {
    themeColor: "#3498db",
    fontPrimary: "Inter",
    darkMode: true,
    showAuthorBio: true,
  },
  notifications: {
    notificationsEnabled: true,
    emailOnComments: true,
    emailOnLogin: false,
    digestFrequency: "weekly",
  },
  seo: {
    analyticsEnabled: false,
    analyticsId: "",
    generateSitemap: true,
    enableSEOTags: true,
    canonicalUrls: true,
  },
  security: {
    maintenanceMode: false,
    cacheEnabled: true,
    twoFactorAuth: false,
    autoUpdates: true,
    maxImageSize: 5,
    loginAttempts: 5,
  },
  isDirty: false,
  lastSaved: null,
};

// Create the context
const BlogSettingsContext = createContext<BlogSettingsContextProps | undefined>(
  undefined
);

// Create a provider component
interface BlogSettingsProviderProps {
  children: ReactNode;
}

export const BlogSettingsProvider: React.FC<BlogSettingsProviderProps> = ({
  children,
}) => {
  const [settings, setSettings] = useState<BlogSettings>(defaultSettings);
  const [loading, setLoading] = useState<boolean>(false);

  // Load settings from localStorage or API on initial mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        // Try to get from localStorage first
        const savedSettings = localStorage.getItem("blogSettings");

        if (savedSettings) {
          // If found in localStorage, use that
          setSettings(JSON.parse(savedSettings));
        } else {
          // Otherwise, could fetch from an API here
          // const response = await fetch('/api/settings');
          // const data = await response.json();
          // setSettings(data);

          // For now, just use defaults
          setSettings(defaultSettings);
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Update functions for each settings category
  const updateGeneralSettings = (updates: Partial<GeneralSettings>) => {
    setSettings((prev) => ({
      ...prev,
      general: { ...prev.general, ...updates },
      isDirty: true,
    }));
  };

  const updateContentSettings = (updates: Partial<ContentSettings>) => {
    setSettings((prev) => ({
      ...prev,
      content: { ...prev.content, ...updates },
      isDirty: true,
    }));
  };

  const updateAppearanceSettings = (updates: Partial<AppearanceSettings>) => {
    setSettings((prev) => ({
      ...prev,
      appearance: { ...prev.appearance, ...updates },
      isDirty: true,
    }));
  };

  const updateNotificationSettings = (
    updates: Partial<NotificationSettings>
  ) => {
    setSettings((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, ...updates },
      isDirty: true,
    }));
  };

  // Save all changes
  const saveChanges = async (): Promise<boolean> => {
    try {
      setLoading(true);

      // Here you would typically send the settings to your backend API
      // const response = await fetch('/api/settings', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(settings),
      // });

      // if (!response.ok) throw new Error('Failed to save settings');

      // For demo purposes, just save to localStorage
      localStorage.setItem(
        "blogSettings",
        JSON.stringify({
          ...settings,
          isDirty: false,
          lastSaved: new Date(),
        })
      );

      // Update the state to reflect the save
      setSettings((prev) => ({
        ...prev,
        isDirty: false,
        lastSaved: new Date(),
      }));

      console.info("Settings saved:", settings);
      return true;
    } catch (error) {
      console.error("Failed to save settings:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Reset to last saved state
  const resetChanges = () => {
    const savedSettings = localStorage.getItem("blogSettings");
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    } else {
      setSettings(defaultSettings);
    }
  };

  return (
    <BlogSettingsContext.Provider
      value={{
        settings,
        updateGeneralSettings,
        updateContentSettings,
        updateAppearanceSettings,
        updateNotificationSettings,
        saveChanges,
        resetChanges,
        loading,
      }}
    >
      {children}
    </BlogSettingsContext.Provider>
  );
};

// Custom hook for using settings
export const useBlogSettings = () => {
  const context = useContext(BlogSettingsContext);
  if (context === undefined) {
    throw new Error(
      "useBlogSettings must be used within a BlogSettingsProvider"
    );
  }
  return context;
};
