import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const BlogCardSkeleton = () => {
  return (
    <Card className="border border-foreground/6 shadow-card-rest">
      <CardHeader className="pt-5 pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <Skeleton className="h-7 w-3/4" />
            <Skeleton className="h-5 w-11/12" />
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-1 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="mt-4 flex flex-wrap gap-1.5">
          <Skeleton className="h-5 w-16 rounded-md" />
          <Skeleton className="h-5 w-20 rounded-md" />
        </div>
      </CardContent>

      <CardFooter className="grid grid-cols-3 gap-4 pt-4 pb-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col gap-1">
            <Skeleton className="h-3 w-10" />
            <Skeleton className="h-6 w-12" />
          </div>
        ))}
      </CardFooter>
    </Card>
  );
};

const DraftBlogCardSkeleton = () => {
  return (
    <Card className="tactile-lift border border-foreground/6 shadow-card-rest">
      <CardHeader className="pt-5 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <Skeleton className="h-7 w-3/4" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-8 w-8 shrink-0" />
        </div>
      </CardHeader>

      <CardContent className="pt-1 pb-4">
        <div className="flex flex-wrap gap-1.5">
          <Skeleton className="h-5 w-16 rounded-md" />
          <Skeleton className="h-5 w-20 rounded-md" />
        </div>
      </CardContent>

      <CardFooter className="pt-3 pb-4">
        <div className="flex w-full items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-20" />
        </div>
      </CardFooter>
    </Card>
  );
};

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
