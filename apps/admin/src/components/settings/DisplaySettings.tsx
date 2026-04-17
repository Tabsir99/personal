import { SettingsSection } from "./SettingsSection";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Palette } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  useAppearanceSettings,
  useSettingsActions,
} from "@/stores/SettingStore";

export default function AppearanceSettings() {
  const appearanceSettings = useAppearanceSettings();
  const { updateAppearance } = useSettingsActions();

  return (
    <SettingsSection
      title="Theme & Display"
      description="Customize how your blog looks to visitors"
      icon={Palette}
    >
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-zinc-300">Theme Color</Label>
          <div className="flex items-center gap-4">
            <Input
              type="color"
              value={appearanceSettings.themeColor}
              onChange={(e) => updateAppearance({ themeColor: e.target.value })}
              className="w-16 h-10"
            />
            <Input
              value={appearanceSettings.themeColor}
              onChange={(e) => updateAppearance({ themeColor: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-zinc-300">Primary Font</Label>
          <Select
            value={appearanceSettings.fontPrimary}
            onValueChange={(value) => updateAppearance({ fontPrimary: value! })}
          >
            <SelectTrigger className="bg-zinc-900 border-zinc-700 text-zinc-100">
              <SelectValue placeholder="Select font" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700">
              <SelectItem value="Inter">Inter</SelectItem>
              <SelectItem value="Roboto">Roboto</SelectItem>
              <SelectItem value="Lato">Lato</SelectItem>
              <SelectItem value="Open Sans">Open Sans</SelectItem>
              <SelectItem value="Montserrat">Montserrat</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <div className="space-y-2">
          <Label className="text-zinc-300">Color Mode</Label>
          <RadioGroup
            value={appearanceSettings.darkMode ? "dark" : "light"}
            onValueChange={(v) => updateAppearance({ darkMode: v === "dark" })}
          >
            <div className="flex gap-4 mt-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="light"
                  id="light"
                  className="border-zinc-600"
                />
                <Label htmlFor="light" className="text-zinc-300">
                  Light
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="dark"
                  id="dark"
                  className="border-zinc-600"
                />
                <Label htmlFor="dark" className="text-zinc-300">
                  Dark
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="auto"
                  id="auto"
                  className="border-zinc-600"
                />
                <Label htmlFor="auto" className="text-zinc-300">
                  Auto (System)
                </Label>
              </div>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label className="text-zinc-300">Author Bio Display</Label>
          <div className="flex items-center justify-between mt-2">
            <span className="text-zinc-400 text-sm">
              Show author bio on posts
            </span>
            <Switch
              checked={appearanceSettings.showAuthorBio}
              onCheckedChange={(value) =>
                updateAppearance({ showAuthorBio: value })
              }
            />
          </div>
        </div>
      </div>
    </SettingsSection>
  );
}
