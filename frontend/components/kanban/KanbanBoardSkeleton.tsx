import { Skeleton } from '@/components/ui/skeleton';

export function KanbanBoardSkeleton() {
  return (
    <div className="flex gap-4 overflow-x-hidden">
      {Array.from({ length: 4 }).map((_, colIndex) => (
        <div key={colIndex} className="flex w-72 shrink-0 flex-col gap-3 rounded-lg bg-muted/50 p-3">
          <Skeleton className="h-5 w-24" />
          {Array.from({ length: colIndex % 2 === 0 ? 3 : 2 }).map((_, cardIndex) => (
            <Skeleton key={cardIndex} className="h-16 w-full" />
          ))}
        </div>
      ))}
    </div>
  );
}
