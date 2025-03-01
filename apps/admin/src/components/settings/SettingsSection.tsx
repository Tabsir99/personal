import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface SettingsSectionProps {
  title: string;
  description?: string;
  icon: React.ElementType;
  children: React.ReactNode;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  title,
  description,
  icon: Icon,
  children,
}) => (
  <Card className="w-full bg-zinc-950 border border-zinc-800 shadow-md">
    <CardHeader className="flex flex-row items-center gap-4 pb-2">
      <div className="bg-zinc-800 p-2 rounded-md">
        <Icon className="w-5 h-5 text-zinc-100" />
      </div>
      <div>
        <CardTitle className="text-zinc-100 text-lg">{title}</CardTitle>
        {description && (
          <CardDescription className="text-zinc-400 text-sm">
            {description}
          </CardDescription>
        )}
      </div>
    </CardHeader>
    <Separator className="mb-4 bg-zinc-800" />
    <CardContent className="pt-2">{children}</CardContent>
  </Card>
);
