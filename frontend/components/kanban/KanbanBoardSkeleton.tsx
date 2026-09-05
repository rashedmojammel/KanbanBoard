import { Skeleton } from '@/components/ui/skeleton';

export function KanbanBoardSkeleton() {
  return (
    <div className="flex gap-4 overflow-x-hidden">
      {Array.from({ length: 4 }).map((_, colIndex) => (
        <div key={colIndex} className="flex w-72 shrink-0 flex-col gap-3 rounded-xl border border-border/60 bg-muted/40 p-3">
          <div className="flex items-center gap-2 px-1">
            <Skeleton className="h-2 w-2 rounded-full" />
            <Skeleton className="h-4 w-20" />
          </div>
          {Array.from({ length: colIndex % 2 === 0 ? 3 : 2 }).map((_, cardIndex) => (
            <Skeleton key={cardIndex} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ))}
    </div>
  );
}