"use client";
import { Button } from "@/components/ui/button";
import { Link2, RefreshCw, ExternalLink, XCircle } from "lucide-react";

import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// import { useBlogSettings } from "@/context/SettingsContext";
import { useState } from "react";
import { SettingsSection } from "./SettingsSection";
import { FaFacebook, FaLinkedin, FaMedium, FaTwitter } from "react-icons/fa6";
import { Card, CardContent } from "../ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SocialPlatform {
  id: "twitter" | "linkedin" | "facebook" | "medium";
  name: string;
  icon: React.ReactNode;
  connected: boolean;
  lastSync: string | null;
  username: string | null;
}

export const SocialIntegrations: React.FC = () => {
  const [platforms, setPlatforms] = useState<SocialPlatform[]>([
    {
      id: "twitter",
      name: "Twitter",
      icon: <FaTwitter />,
      connected: false,
      lastSync: null,
      username: null,
    },
    {
      id: "linkedin",
      name: "LinkedIn",
      icon: <FaLinkedin />,
      connected: false,
      lastSync: null,
      username: null,
    },
    {
      id: "facebook",
      name: "Facebook",
      icon: <FaFacebook />,
      connected: false,
      lastSync: null,
      username: null,
    },

    {
      id: "medium",
      name: "Medium",
      icon: <FaMedium />,
      connected: true,
      lastSync: "1 day ago",
      username: "john.writer",
    },
  ]);

  const [autoShare, setAutoShare] = useState({
    newPosts: true,
    updates: false,
  });

  const handleConnect = async (_platformId: SocialPlatform["id"]) => {
    // For demo purposes, toggle connection status
    window.location.href = "http://localhost:3000/api/auth/signin/linkedin";
  };

  const handleDisconnect = (platformId: string) => {
    if (
      confirm(`Are you sure you want to disconnect your ${platformId} account?`)
    ) {
      setPlatforms(
        platforms.map((platform) =>
          platform.id === platformId
            ? {
                ...platform,
                connected: false,
                lastSync: null,
                username: null,
              }
            : platform,
        ),
      );
    }
  };

  const handleRefreshToken = (platformId: string) => {
    // In a real application, this would refresh the OAuth token
    alert(`Refreshing token for ${platformId}...`);

    // For demo purposes, update last sync time
    setPlatforms(
      platforms.map((platform) =>
        platform.id === platformId
          ? { ...platform, lastSync: "Just now" }
          : platform,
      ),
    );
  };

  return (
    <>
      <SettingsSection
        title="Social Media Integrations"
        description="Connect your blog to social media platforms for sharing content"
        icon={Link2}
      >
        <div className="space-y-6">
          <div className="grid gap-6">
            {platforms.map((platform) => (
              // Update the platform card styling
              <Card key={platform.id} className="border border-border">
                <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between p-5">
                  <div className="flex items-center gap-3 mb-4 sm:mb-0">
                    <div className="text-muted-foreground text-lg">
                      {platform.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{platform.name}</h3>
                        {platform.connected ? (
                          <Badge variant="outline" className="text-xs text-primary">
                            Connected
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-xs text-muted-foreground"
                          >
                            Not Connected
                          </Badge>
                        )}
                      </div>
                      {platform.connected && platform.username && (
                        <p className="text-sm text-muted-foreground mt-1">
                          @{platform.username} • Last synced:{" "}
                          {platform.lastSync}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {platform.connected ? (
                      <>
                        <Tooltip>
                          <TooltipTrigger
                            render={
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRefreshToken(platform.id)}
                              >
                                <RefreshCw className="h-3.5 w-3.5" />
                                Refresh
                              </Button>
                            }
                          />
                          <TooltipContent>
                            <p>Refresh connection token</p>
                          </TooltipContent>
                        </Tooltip>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDisconnect(platform.id)}
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          Disconnect
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleConnect(platform.id)}
                      >
                        <span className="mr-2">{platform.icon}</span>
                        Connect
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Sharing Preferences"
        description="Configure how and when content is shared to your connected platforms"
        icon={ExternalLink}
      >
        <div className="space-y-6">
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-foreground/80">Auto-share new posts</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically share new blog posts when published
                </p>
              </div>
              <Switch
                checked={autoShare.newPosts}
                onCheckedChange={(checked) =>
                  setAutoShare({ ...autoShare, newPosts: checked })
                }
              />
            </div>
            <Separator className="my-2 bg-border" />
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-foreground/80">
                  Auto-share content updates
                </Label>
                <p className="text-sm text-muted-foreground">
                  Share when existing posts are significantly updated
                </p>
              </div>
              <Switch
                checked={autoShare.updates}
                onCheckedChange={(checked) =>
                  setAutoShare({ ...autoShare, updates: checked })
                }
              />
            </div>
          </div>
        </div>
      </SettingsSection>
    </>
  );
};
