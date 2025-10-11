"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface MediaSkeletonProps {
  count: number;
  className?: string;
}

export const MediaSkeleton = ({ count, className }: MediaSkeletonProps) => {
  if (count === 0) return null;

  const getSkeletonLayout = (count: number) => {
    if (count === 1) {
      return "grid-cols-1";
    } else if (count === 2) {
      return "grid-cols-2";
    } else if (count === 3) {
      return "grid-cols-2";
    } else if (count === 4) {
      return "grid-cols-2";
    } else {
      return "grid-cols-2";
    }
  };

  const renderSkeletonItem = (index: number, total: number) => {
    if (total === 1) {
      return (
        <div className="relative rounded-lg overflow-hidden w-64 border border-border bg-background-accent/40">
          <Skeleton className="w-full h-48" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Skeleton className="w-8 h-8 rounded-full" />
          </div>
        </div>
      );
    }

    if (total === 2) {
      return (
        <div className="relative rounded-lg overflow-hidden w-32 border border-border bg-background-accent/40">
          <Skeleton className="w-full h-32" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Skeleton className="w-6 h-6 rounded-full" />
          </div>
        </div>
      );
    }

    if (total === 3) {
      if (index === 0) {
        return (
          <div className="relative rounded-lg overflow-hidden w-full h-32 border border-border bg-background-accent/40">
            <Skeleton className="w-full h-full" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Skeleton className="w-6 h-6 rounded-full" />
            </div>
          </div>
        );
      } else {
        return (
          <div className="relative rounded-lg overflow-hidden w-full h-16 border border-border bg-background-accent/40">
            <Skeleton className="w-full h-full" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Skeleton className="w-4 h-4 rounded-full" />
            </div>
          </div>
        );
      }
    }

    if (total === 4) {
      return (
        <div className="relative rounded-lg overflow-hidden w-full h-24 border border-border bg-background-accent/40">
          <Skeleton className="w-full h-full" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Skeleton className="w-5 h-5 rounded-full" />
          </div>
        </div>
      );
    }

    // Default for 5+ items
    return (
      <div className="relative rounded-lg overflow-hidden w-full h-20 border border-border bg-background-accent/40">
        <Skeleton className="w-full h-full" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Skeleton className="w-4 h-4 rounded-full" />
        </div>
      </div>
    );
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className={cn("grid gap-2", getSkeletonLayout(count))}>
        {Array.from({ length: Math.min(count, 4) }).map((_, index) => (
          <div key={index}>
            {renderSkeletonItem(index, count)}
          </div>
        ))}
      </div>

      {count > 4 && (
        <div className="text-center">
          <Skeleton className="w-16 h-4 mx-auto" />
        </div>
      )}
    </div>
  );
};

interface MediaGridSkeletonProps {
  items: Array<{ id: string; isLoading?: boolean }>;
  className?: string;
}

export const MediaGridSkeleton = ({ items, className }: MediaGridSkeletonProps) => {
  const loadingItems = items.filter(item => item.isLoading);

  if (loadingItems.length === 0) return null;

  return <MediaSkeleton count={loadingItems.length} className={className} />;
};
