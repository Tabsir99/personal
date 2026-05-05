"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save } from "lucide-react";

import GeneralSettings from "@/components/settings/GeneralSettings";
import ContentSettings from "@/components/settings/ContentSettings";
import DisplaySettings from "@/components/settings/DisplaySettings";
import NotificationSettings from "@/components/settings/NotificationSettings";
import { SocialIntegrations } from "@/components/settings/SocialIntegration";
import { useBlogSettingsStore } from "@/stores/SettingStore";
import { PageHeader } from "@/components/ui/common/PageHeader";

const SettingsPage = () => {
  const saveChanges = useBlogSettingsStore.getState().saveChanges;
  return (
    <>
      <PageHeader
        title="Settings"
        actionButton={{
          onClick: saveChanges,
          text: (
            <>
              <Save /> Save Changes
            </>
          ),
        }}
      />
      <Tabs defaultValue="notifications" className="w-full">
        <div className="flex justify-center mb-6">
          <TabsList className="p-1">
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
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
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
    </>
  );
};

export default SettingsPage;
