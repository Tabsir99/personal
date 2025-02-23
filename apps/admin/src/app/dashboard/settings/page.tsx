"use client"

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  LayoutDashboard, 
  Globe, 
  Bell, 
  Save, 
  ChevronRight 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface SettingsSectionProps {
  title: string;
  description?: string;
  icon: React.ElementType;
  children: React.ReactNode;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({
  title,
  description,
  icon: Icon,
  children,
}) => (
  <Card className="w-full bg-zinc-900 border-neutral-800">
    <CardHeader className="flex flex-row items-center space-x-4 space-y-0 pb-2">
      <Icon className="w-6 h-6 text-neutral-200" />
      <div>
        <CardTitle className="text-neutral-100">{title}</CardTitle>
        {description && <CardDescription className="text-neutral-400">{description}</CardDescription>}
      </div>
    </CardHeader>
    <Separator className="mb-4 bg-zinc-800" />
    <CardContent>{children}</CardContent>
  </Card>
);

const SettingsPage: React.FC = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [siteTitle, setSiteTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const handleSaveChanges = () => {
    console.info({
      siteTitle,
      metaDescription,
      notificationsEnabled,
      analyticsEnabled,
      maintenanceMode,
    });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-neutral-100 p-6 md:p-8 lg:p-12">
      <div className="container max-w-5xl mx-auto space-y-8">
        <header className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <LayoutDashboard className="w-10 h-10 text-neutral-200" />
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-neutral-100">
              Admin Dashboard
            </h1>
          </div>
        </header>

        <div className="space-y-6">
          <SettingsSection
            title="General Settings"
            description="Configure your blog's core information"
            icon={Globe}
          >
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-neutral-300">Site Title</Label>
                <Input
                  value={siteTitle}
                  onChange={(e) => setSiteTitle(e.target.value)}
                  placeholder="Enter your blog name"
                  className="w-full bg-zinc-900 border-neutral-800 text-neutral-100 placeholder-neutral-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-neutral-300">Meta Description</Label>
                <Textarea
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="Describe your blog for search engines"
                  className="min-h-[120px] bg-zinc-900 border-neutral-800 text-neutral-100 placeholder-neutral-500"
                />
              </div>
            </div>
          </SettingsSection>

          <SettingsSection
            title="Site Preferences"
            description="Customize your blog's behavior"
            icon={Bell}
          >
            <div className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center space-x-2 text-neutral-300">
                    <span>Notifications</span>
                  </Label>
                  <Switch
                    checked={notificationsEnabled}
                    onCheckedChange={setNotificationsEnabled}
                    
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="flex items-center space-x-2 text-neutral-300">
                    <span>Analytics</span>
                  </Label>
                  <Switch
                    checked={analyticsEnabled}
                    onCheckedChange={setAnalyticsEnabled}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="flex items-center space-x-2 text-neutral-300">
                    <span>Maintenance Mode</span>
                  </Label>
                  <Switch
                    checked={maintenanceMode}
                    onCheckedChange={setMaintenanceMode}
                  />
                </div>
              </div>
            </div>
          </SettingsSection>

          <div className="flex justify-end">
            <Button 
              onClick={handleSaveChanges} 
              className="group bg-zinc-800 hover:bg-zinc-700 text-neutral-100"
            >
              <Save className="mr-2 h-4 w-4 group-hover:animate-pulse" />
              Save Changes
              <ChevronRight className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;