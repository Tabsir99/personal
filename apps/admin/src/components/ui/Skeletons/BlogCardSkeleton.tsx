import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

const BlogCardSkeleton = () => {
  return (
    <Card>
      {/* Header - Title and Actions */}
      <CardHeader className="pb-3 pt-5">
        <div className="flex justify-between items-start gap-4">
          {/* Blog Title and Description skeleton */}
          <div className="flex flex-col space-y-2 w-full">
            {/* Title */}
            <div className="h-7 bg-muted rounded-md shimmer w-3/4" />
            {/* Description */}
            <div className="h-5 bg-muted rounded-md shimmer w-11/12" />
          </div>

          {/* Actions buttons skeleton */}
          <div className="flex items-center gap-1">
            <div className="h-8 w-8 bg-muted rounded-md shimmer" />
            <div className="h-8 w-8 bg-muted rounded-md shimmer" />
          </div>
        </div>
      </CardHeader>

      {/* Content - Metadata and Tags */}
      <CardContent className="pb-4 pt-2">
        {/* Metadata row */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Status Badge */}
          <div className="h-5 w-16 bg-muted rounded-full shimmer" />

          {/* Category */}
          <div className="flex items-center gap-2">
            <div className="h-3.5 w-3.5 bg-muted rounded-sm shimmer" />
            <div className="h-5 w-20 bg-muted rounded-md shimmer" />
          </div>

          {/* Date */}
          <div className="flex items-center gap-2">
            <div className="h-3.5 w-3.5 bg-muted rounded-sm shimmer" />
            <div className="h-5 w-24 bg-muted rounded-md shimmer" />
          </div>

          {/* Reading time */}
          <div className="flex items-center gap-2">
            <div className="h-3.5 w-3.5 bg-muted rounded-sm shimmer" />
            <div className="h-5 w-16 bg-muted rounded-md shimmer" />
          </div>
        </div>

        {/* Tags skeleton */}
        <div className="flex flex-wrap gap-2 mt-4">
          <div className="h-5 w-16 bg-muted rounded-md shimmer" />
          <div className="h-5 w-20 bg-muted rounded-md shimmer" />
          <div className="h-5 w-14 bg-muted rounded-md shimmer" />
        </div>
      </CardContent>

      {/* Footer - Stats */}
      <CardFooter className="border-t border-border pt-4 pb-4 grid grid-cols-4 gap-4">
        {/* Stats items */}
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="h-4 w-4 bg-muted rounded-sm shimmer" />
            <div className="flex flex-col gap-1">
              <div className="h-5 w-10 bg-muted rounded-md shimmer" />
              <div className="h-4 w-14 bg-muted rounded-md shimmer" />
            </div>
          </div>
        ))}
      </CardFooter>
    </Card>
  );
};

const DraftBlogCardSkeleton = () => {
  return (
    <Card>
      {/* Header - Title, Description and Menu */}
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          {/* Blog Title */}
          <div className="h-7 bg-muted rounded-md shimmer w-3/4" />
          {/* Menu skeleton */}
          <div className="h-8 w-8 bg-muted rounded-md shimmer" />
        </div>
        {/* Description */}
        <div className="h-5 bg-muted rounded-md shimmer w-11/12 mt-2" />
      </CardHeader>

      {/* Content - Tags */}
      <CardContent className="py-2">
        <div className="flex flex-wrap gap-2">
          <div className="h-5 w-16 bg-muted rounded-md shimmer" />
          <div className="h-5 w-20 bg-muted rounded-md shimmer" />
          <div className="h-5 w-14 bg-muted rounded-md shimmer" />
        </div>
      </CardContent>

      {/* Footer - Updated time and read time */}
      <CardFooter className="pt-2 pb-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 bg-muted rounded-sm shimmer" />
          <div className="h-5 w-32 bg-muted rounded-md shimmer" />
        </div>
        <div className="h-5 w-20 bg-muted rounded-md shimmer" />
      </CardFooter>
    </Card>
  );
};
// For loading multiple cards
export const BlogCardSkeletonGrid = ({ count = 4 }) => {
  return Array(count)
    .fill(0)
    .map((_, index) => <BlogCardSkeleton key={index} />);
};

export const DraftBlogCardSkeletonGrid = ({ count = 4 }) => {
  return Array(count)
    .fill(0)
    .map((_, index) => <DraftBlogCardSkeleton key={index} />);
};
