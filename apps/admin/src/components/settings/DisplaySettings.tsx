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
          <Label className="text-foreground/80">Theme Color</Label>
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
          <Label className="text-foreground/80">Primary Font</Label>
          <Select
            value={appearanceSettings.fontPrimary}
            onValueChange={(value) => updateAppearance({ fontPrimary: value! })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select font" />
            </SelectTrigger>
            <SelectContent>
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
          <Label className="text-foreground/80">Color Mode</Label>
          <RadioGroup
            value={appearanceSettings.darkMode ? "dark" : "light"}
            onValueChange={(v) => updateAppearance({ darkMode: v === "dark" })}
          >
            <div className="flex gap-4 mt-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="light" id="light" />
                <Label htmlFor="light" className="text-foreground/80">
                  Light
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dark" id="dark" />
                <Label htmlFor="dark" className="text-foreground/80">
                  Dark
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="auto" id="auto" />
                <Label htmlFor="auto" className="text-foreground/80">
                  Auto (System)
                </Label>
              </div>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label className="text-foreground/80">Author Bio Display</Label>
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm text-muted-foreground">
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
