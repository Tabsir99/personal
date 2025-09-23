"use client";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import {
  BlogSettings,
  GeneralSettings,
  ContentSettings,
  NotificationSettings,
  AppearanceSettings,
} from "@/types/settingTypes";

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

interface BlogSettingsState extends BlogSettings {
  loading: boolean;

  // Actions
  updateGeneralSettings: (updates: Partial<GeneralSettings>) => void;
  updateContentSettings: (updates: Partial<ContentSettings>) => void;
  updateAppearanceSettings: (updates: Partial<AppearanceSettings>) => void;
  updateNotificationSettings: (updates: Partial<NotificationSettings>) => void;
  saveChanges: () => Promise<boolean>;
  resetChanges: () => void;
  loadSettings: () => Promise<void>;
}

export const useBlogSettingsStore = create<BlogSettingsState>()(
  devtools(
    persist(
      (set, get) => ({
        ...defaultSettings,
        loading: false,

        updateGeneralSettings: (updates) =>
          set(
            (state) => ({
              general: { ...state.general, ...updates },
              isDirty: true,
            }),
            false,
            "updateGeneralSettings"
          ),

        updateContentSettings: (updates) =>
          set(
            (state) => ({
              content: { ...state.content, ...updates },
              isDirty: true,
            }),
            false,
            "updateContentSettings"
          ),

        updateAppearanceSettings: (updates) =>
          set(
            (state) => ({
              appearance: { ...state.appearance, ...updates },
              isDirty: true,
            }),
            false,
            "updateAppearanceSettings"
          ),

        updateNotificationSettings: (updates) =>
          set(
            (state) => ({
              notifications: { ...state.notifications, ...updates },
              isDirty: true,
            }),
            false,
            "updateNotificationSettings"
          ),

        saveChanges: async () => {
          set({ loading: true }, false, "saveChanges-start");

          try {
            const currentState = get();

            // Here you would typically send to your backend API
            // const response = await fetch('/api/settings', {
            //   method: 'POST',
            //   headers: { 'Content-Type': 'application/json' },
            //   body: JSON.stringify(currentState),
            // });
            // if (!response.ok) throw new Error('Failed to save settings');

            // Update state to reflect successful save
            set(
              {
                isDirty: false,
                lastSaved: new Date(),
                loading: false,
              },
              false,
              "saveChanges-success"
            );

            console.info("Settings saved:", currentState);
            return true;
          } catch (error) {
            console.error("Failed to save settings:", error);
            set({ loading: false }, false, "saveChanges-error");
            return false;
          }
        },

        resetChanges: () =>
          set(
            {
              ...defaultSettings,
              loading: false,
            },
            false,
            "resetChanges"
          ),

        loadSettings: async () => {
          set({ loading: true }, false, "loadSettings-start");

          try {
            // Could fetch from API here
            // const response = await fetch('/api/settings');
            // const data = await response.json();
            // set({ ...data, loading: false });

            // For now, persist middleware handles localStorage automatically
            set({ loading: false }, false, "loadSettings-success");
          } catch (error) {
            console.error("Failed to load settings:", error);
            set(
              {
                ...defaultSettings,
                loading: false,
              },
              false,
              "loadSettings-error"
            );
          }
        },
      }),
      {
        name: "blog-settings", // localStorage key
        // Only persist the settings, not loading state
        partialize: (state) => ({
          general: state.general,
          content: state.content,
          appearance: state.appearance,
          notifications: state.notifications,
          seo: state.seo,
          security: state.security,
          isDirty: state.isDirty,
          lastSaved: state.lastSaved,
        }),
      }
    ),
    { name: "blog-settings-store" }
  )
);

// Selectors for optimized subscriptions
export const useGeneralSettings = () =>
  useBlogSettingsStore((state) => state.general);

export const useContentSettings = () =>
  useBlogSettingsStore((state) => state.content);

export const useAppearanceSettings = () =>
  useBlogSettingsStore((state) => state.appearance);

export const useSettingsActions = () => {
  const store = useBlogSettingsStore.getState();
  return {
    updateGeneral: store.updateGeneralSettings,
    updateContent: store.updateContentSettings,
    updateAppearance: store.updateAppearanceSettings,
    updateNotifications: store.updateNotificationSettings,
    save: store.saveChanges,
    reset: store.resetChanges,
  };
};

export const useSettingsStatus = () =>
  useBlogSettingsStore((state) => ({
    isDirty: state.isDirty,
    loading: state.loading,
    lastSaved: state.lastSaved,
  }));
