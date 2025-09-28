export interface GeneralSettings {
  siteTitle: string;
  metaDescription: string;
  faviconUrl: string;
  logoUrl: string;
  language: string;
  timezone: string;
}

export interface ContentSettings {
  postsPerPage: number;
  defaultCategory: string;
  commentModeration: boolean;
  allowComments: boolean;
  excerptLength: number;
}

export interface AppearanceSettings {
  themeColor: string;
  fontPrimary: string;
  darkMode: boolean;
  showAuthorBio: boolean;
}

export interface NotificationSettings {
  notificationsEnabled: boolean;
  emailOnComments: boolean;
  emailOnLogin: boolean;
  digestFrequency: string;
}

export interface SEOSettings {
  analyticsEnabled: boolean;
  analyticsId: string;
  generateSitemap: boolean;
  enableSEOTags: boolean;
  canonicalUrls: boolean;
}

export interface SecuritySettings {
  maintenanceMode: boolean;
  cacheEnabled: boolean;
  twoFactorAuth: boolean;
  autoUpdates: boolean;
  maxImageSize: number;
  loginAttempts: number;
}

// Combine all settings into one interface
export interface BlogSettings {
  general: GeneralSettings;
  content: ContentSettings;
  appearance: AppearanceSettings;
  notifications: NotificationSettings;
  seo: SEOSettings;
  security: SecuritySettings;
  isDirty: boolean; // Track if changes have been made
  lastSaved: Date | null;
}
