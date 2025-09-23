import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

const BlogCardSkeleton = () => {
  return (
    <Card className="bg-zinc-900 border-zinc-800 text-white">
      {/* Header - Title and Actions */}
      <CardHeader className="pb-3 pt-5">
        <div className="flex justify-between items-start gap-4">
          {/* Blog Title and Description skeleton */}
          <div className="flex flex-col space-y-2 w-full">
            {/* Title */}
            <div className="h-7 bg-zinc-800 rounded-md shimmer w-3/4" />
            {/* Description */}
            <div className="h-5 bg-zinc-800 rounded-md shimmer w-11/12" />
          </div>

          {/* Actions buttons skeleton */}
          <div className="flex items-center gap-1">
            <div className="h-8 w-8 bg-zinc-800 rounded-md shimmer" />
            <div className="h-8 w-8 bg-zinc-800 rounded-md shimmer" />
          </div>
        </div>
      </CardHeader>

      {/* Content - Metadata and Tags */}
      <CardContent className="pb-4 pt-2">
        {/* Metadata row */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Status Badge */}
          <div className="h-5 w-16 bg-zinc-800 rounded-full shimmer" />

          {/* Category */}
          <div className="flex items-center gap-2">
            <div className="h-3.5 w-3.5 bg-zinc-800 rounded-sm shimmer" />
            <div className="h-5 w-20 bg-zinc-800 rounded-md shimmer" />
          </div>

          {/* Date */}
          <div className="flex items-center gap-2">
            <div className="h-3.5 w-3.5 bg-zinc-800 rounded-sm shimmer" />
            <div className="h-5 w-24 bg-zinc-800 rounded-md shimmer" />
          </div>

          {/* Reading time */}
          <div className="flex items-center gap-2">
            <div className="h-3.5 w-3.5 bg-zinc-800 rounded-sm shimmer" />
            <div className="h-5 w-16 bg-zinc-800 rounded-md shimmer" />
          </div>
        </div>

        {/* Tags skeleton */}
        <div className="flex flex-wrap gap-2 mt-4">
          <div className="h-5 w-16 bg-zinc-800 rounded-md shimmer" />
          <div className="h-5 w-20 bg-zinc-800 rounded-md shimmer" />
          <div className="h-5 w-14 bg-zinc-800 rounded-md shimmer" />
        </div>
      </CardContent>

      {/* Footer - Stats */}
      <CardFooter className="border-t border-zinc-800 pt-4 pb-4 grid grid-cols-4 gap-4">
        {/* Stats items */}
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="h-4 w-4 bg-zinc-800 rounded-sm shimmer" />
            <div className="flex flex-col gap-1">
              <div className="h-5 w-10 bg-zinc-800 rounded-md shimmer" />
              <div className="h-4 w-14 bg-zinc-800 rounded-md shimmer" />
            </div>
          </div>
        ))}
      </CardFooter>

      {/* CSS for shimmer effect */}
      <style jsx global>{`
        .shimmer {
          background: linear-gradient(
            90deg,
            rgba(39, 39, 42, 0.5) 0%,
            rgba(63, 63, 70, 0.7) 50%,
            rgba(39, 39, 42, 0.5) 100%
          );
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </Card>
  );
};

// For loading multiple cards
export const BlogCardSkeletonGrid = ({ count = 3 }) => {
  return Array(count)
    .fill(0)
    .map((_, index) => <BlogCardSkeleton key={index} />);
};

export default BlogCardSkeleton;
