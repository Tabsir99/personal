import { SettingsSection } from "./SettingsSection";
import { Label } from "@/components/ui/label";
import { NumericInput } from "@/components/ui/NumericInput";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { FileText } from "lucide-react";
import { useContentSettings, useSettingsActions } from "@/stores/SettingStore";

export default function ContentSettings() {
  // Use selectors for optimized performance
  const contentSettings = useContentSettings();
  const { updateContent } = useSettingsActions();

  return (
    <SettingsSection
      title="Content Settings"
      description="Manage how content displays on your blog"
      icon={FileText}
    >
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-foreground/80">Posts Per Page</Label>
          <NumericInput
            value={contentSettings.postsPerPage}
            onChange={(value) => updateContent({ postsPerPage: value })}
            min={1}
            max={50}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-foreground/80">Default Category</Label>
          <Select
            value={contentSettings.defaultCategory}
            onValueChange={(value) =>
              updateContent({ defaultCategory: value! })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select default category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="uncategorized">Uncategorized</SelectItem>
              <SelectItem value="technology">Technology</SelectItem>
              <SelectItem value="news">News</SelectItem>
              <SelectItem value="lifestyle">Lifestyle</SelectItem>
              <SelectItem value="tutorials">Tutorials</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <div className="space-y-2">
          <Label className="text-foreground/80">Excerpt Length (characters)</Label>
          <div className="pt-2">
            <Slider
              value={[contentSettings.excerptLength]}
              min={50}
              max={500}
              step={10}
              onValueChange={(value) =>
                updateContent({ excerptLength: value[0] })
              }
              className="py-4"
            />
            <div className="text-sm text-right text-muted-foreground">
              {contentSettings.excerptLength} characters
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-foreground/80">Allow Comments</Label>
            <Switch
              checked={contentSettings.allowComments}
              onCheckedChange={(value) =>
                updateContent({ allowComments: value })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-foreground/80">Comment Moderation</Label>
            <Switch
              checked={contentSettings.commentModeration}
              onCheckedChange={(value) =>
                updateContent({ commentModeration: value })
              }
            />
          </div>
        </div>
      </div>
    </SettingsSection>
  );
}
