import Link from "next/link";
import { Settings, ExternalLink } from "lucide-react";
import { AdminBlogListItem } from "@/types/blogTypes";
import { env } from "@/utils/utils";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function CMSBlogCard({
  adminBlogListItem,
}: {
  adminBlogListItem: AdminBlogListItem;
}) {
  return (
    <Card className="bg-zinc-900 border-zinc-800 text-white">
      <CardContent className="pt-5 pr-1">
        <div className="flex justify-between items-start gap-3">
          {/* Blog Title */}
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-gray-100 capitalize">
              {adminBlogListItem.blogName}
            </h2>
            <div className="flex space-x-3 mt-2 text-gray-400 text-sm">
              <span>{adminBlogListItem.categoryId}</span>
              <span>|</span>
              <time>
                {new Date(adminBlogListItem.createdAt).toDateString()}
              </time>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-0 -mt-1">
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="text-gray-400 hover:text-gray-200 hover:bg-zinc-800"
            >
              <Link
                href={`${env.BLOGSITE_HOSTNAME}/blogs/${adminBlogListItem.link}`}
                target="_blank"
                title="View Blog"
              >
                <ExternalLink className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>

      {/* Post Stats */}
      <CardFooter className="border-t border-gray-700 pt-4 grid grid-cols-4 gap-0">
        <MetricItem
          label="Views"
          value={adminBlogListItem.pageMetrics.totalVisitors}
        />
        <MetricItem
          label="Likes"
          value={adminBlogListItem.pageMetrics.blogMetrics?.totalLikes}
        />
        <MetricItem
          label="Comments"
          value={adminBlogListItem.pageMetrics.blogMetrics?.totalComments}
        />
        <div className="flex flex-col text-gray-400">
          <Badge
            variant={
              adminBlogListItem.status === "active"
                ? "secondary"
                : "destructive"
            }
            className="w-fit text-[16px] translate-x-8 capitalize"
          >
            {adminBlogListItem.status}
          </Badge>
        </div>
      </CardFooter>
    </Card>
  );
}

// Helper component for metrics
const MetricItem = ({
  label,
  value,
}: {
  label: string;
  value: number | undefined;
}) => (
  <div className="flex flex-col text-gray-400">
    <span className="text-lg font-semibold text-gray-200">{value ?? 0}</span>
    <span className="text-sm">{label}</span>
  </div>
);
