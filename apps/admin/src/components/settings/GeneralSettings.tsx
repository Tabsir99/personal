import { SettingsSection } from "./SettingsSection";
import { Globe } from "lucide-react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useGeneralSettings, useSettingsActions } from "@/stores/SettingStore";

export default function GeneralSettings() {
  const generalSettings = useGeneralSettings();
  const { updateGeneral } = useSettingsActions();

  return (
    <SettingsSection
      title="Site Information"
      description="Configure your blog's core information"
      icon={Globe}
    >
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-zinc-300">Site Title</Label>
          <Input
            value={generalSettings.siteTitle}
            onChange={(e) => updateGeneral({ siteTitle: e.target.value })}
            placeholder="Enter your blog name"
            className="bg-zinc-900 border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-zinc-300">Meta Description</Label>
          <Textarea
            value={generalSettings.metaDescription}
            onChange={(e) => updateGeneral({ metaDescription: e.target.value })}
            placeholder="Describe your blog for search engines"
            className="min-h-[80px] bg-zinc-900 border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <div className="space-y-2">
          <Label className="text-zinc-300">Favicon URL</Label>
          <Input
            value={generalSettings.faviconUrl}
            onChange={(e) => updateGeneral({ faviconUrl: e.target.value })}
            placeholder="https://yourblog.com/favicon.ico"
            className="bg-zinc-900 border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-zinc-300">Logo URL</Label>
          <Input
            value={generalSettings.logoUrl}
            onChange={(e) => updateGeneral({ logoUrl: e.target.value })}
            placeholder="https://yourblog.com/logo.png"
            className="bg-zinc-900 border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <div className="space-y-2">
          <Label className="text-zinc-300">Default Language</Label>
          <Select
            value={generalSettings.language}
            onValueChange={(value) => updateGeneral({ language: value })}
          >
            <SelectTrigger className="bg-zinc-900 border-zinc-700 text-zinc-100">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700">
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Spanish</SelectItem>
              <SelectItem value="fr">French</SelectItem>
              <SelectItem value="de">German</SelectItem>
              <SelectItem value="ja">Japanese</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-zinc-300">Timezone</Label>
          <Select
            value={generalSettings.timezone}
            onValueChange={(value) => updateGeneral({ timezone: value })}
          >
            <SelectTrigger className="bg-zinc-900 border-zinc-700 text-zinc-100">
              <SelectValue placeholder="Select timezone" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700">
              <SelectItem value="UTC">UTC</SelectItem>
              <SelectItem value="EST">Eastern Time (EST)</SelectItem>
              <SelectItem value="CST">Central Time (CST)</SelectItem>
              <SelectItem value="PST">Pacific Time (PST)</SelectItem>
              <SelectItem value="GMT">GMT</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </SettingsSection>
  );
}
