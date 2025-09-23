"use client";
import { Button } from "@/components/ui/button";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Save } from "lucide-react";

import GeneralSettings from "@/components/settings/GeneralSettings";
import ContentSettings from "@/components/settings/ContentSettings";
import DisplaySettings from "@/components/settings/DisplaySettings";
import NotificationSettings from "@/components/settings/NotificationSettings";
import { SocialIntegrations } from "@/components/settings/SocialIntegration";
import { useBlogSettingsStore } from "@/stores/SettingStore";

const SettingsPage = () => {
  const saveChanges = useBlogSettingsStore.getState().saveChanges;
  return (
    <div className="min-h-screen bg-zinc-900/60 text-zinc-100">
      <div className="flex flex-col">
        <header className="sticky top-0 z-10  backdrop-blur-sm border-b border-zinc-800 p-4">
          <div className="container max-w-6xl mx-auto flex items-center justify-between">
            <h1 className="text-2xl font-bold text-zinc-100">Settings</h1>
            <Button
              onClick={saveChanges}
              className="bg-blue-600 hover:bg-blue-700 text-white transition-all"
            >
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </header>

        <main className="container min-w-full mx-auto p-4 pb-20">
          <Tabs defaultValue="notifications" className="w-full">
            <div className="flex justify-center mb-6">
              <TabsList className="bg-zinc-900 p-1">
                {[
                  { value: "general", label: "General" },
                  { value: "content", label: "Content" },
                  { value: "social", label: "Social Integration" },
                  { value: "appearance", label: "Appearance" },
                  { value: "notifications", label: "Notifications" },
                ].map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <TabsContent value="general" className="space-y-6 mt-2">
              <GeneralSettings />
            </TabsContent>

            <TabsContent value="content" className="space-y-6 mt-2">
              <ContentSettings />
            </TabsContent>

            <TabsContent value="social" className="space-y- mt-2">
              <SocialIntegrations />
            </TabsContent>

            <TabsContent value="appearance" className="space-y-6 mt-2">
              <DisplaySettings />
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6 mt-2">
              <NotificationSettings />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;
