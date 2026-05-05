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
  <Card className="w-full border border-border bg-card shadow-md">
    <CardHeader className="flex flex-row items-center gap-4 pb-2">
      <div className="rounded-md bg-muted p-2">
        <Icon className="h-5 w-5 text-foreground" />
      </div>
      <div>
        <CardTitle className="text-lg text-foreground">{title}</CardTitle>
        {description && (
          <CardDescription className="text-sm text-muted-foreground">
            {description}
          </CardDescription>
        )}
      </div>
    </CardHeader>
    <Separator className="mb-4 bg-border" />
    <CardContent className="pt-2">{children}</CardContent>
  </Card>
);
