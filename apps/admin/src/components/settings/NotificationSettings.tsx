import { SettingsSection } from "./SettingsSection";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Switch } from "../ui/switch";
import { Mail } from "lucide-react";
import { useState } from "react";

export default function NotificationSettings() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [emailOnComments, setEmailOnComments] = useState(false);
  const [emailOnLogin, setEmailOnLogin] = useState(false);
  const [digestFrequency, setDigestFrequency] = useState("weekly");

  return (
    <SettingsSection
      title="Email & Notifications"
      description="Configure how you receive updates and alerts"
      icon={Mail}
    >
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-zinc-300">Enable Notifications</Label>
            <Switch
              checked={notificationsEnabled}
              onCheckedChange={setNotificationsEnabled}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-zinc-300">Email on New Comments</Label>
            <Switch
              checked={emailOnComments}
              onCheckedChange={setEmailOnComments}
              disabled={!notificationsEnabled}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-zinc-300">Email on Login Attempts</Label>
            <Switch
              checked={emailOnLogin}
              onCheckedChange={setEmailOnLogin}
              disabled={!notificationsEnabled}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-zinc-300">Email Digest Frequency</Label>
          <Select
            value={digestFrequency}
            onValueChange={setDigestFrequency}
            disabled={!notificationsEnabled}
          >
            <SelectTrigger className="bg-zinc-900 border-zinc-700 text-zinc-100">
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700">
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="never">Never</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </SettingsSection>
  );
}
