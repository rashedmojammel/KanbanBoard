'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { FiMoreVertical, FiEdit2, FiTrash2, FiArrowRight, FiMove } from 'react-icons/fi';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { Column, Task } from '@/types';

interface TaskCardProps {
  task: Task;
  columns: Column[];
  onEdit: () => void;
  onDelete: () => void;
  onMoveToColumn: (targetColumnId: string) => void;
}

export function TaskCard({ task, columns, onEdit, onDelete, onMoveToColumn }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: 'task', columnId: task.columnId },
  });

  const otherColumns = columns.filter((c) => c.id !== task.columnId);

  return (
    <motion.div
      ref={setNodeRef}
      // dnd-kit fully owns `transform`/`transition` here for drag positioning -
      // Framer only animates opacity/scale below, so the two never fight over the same CSS property.
      style={{ transform: CSS.Transform.toString(transform), transition }}
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: isDragging ? 0.4 : 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={isDragging ? undefined : { y: -1 }}
      transition={{ duration: 0.15 }}
      className={cn(
        'group flex items-start gap-2 rounded-lg border border-border bg-card p-3 shadow-sm transition-all hover:border-brand-accent/40 hover:shadow-md',
      )}
    >
      <button
        type="button"
        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded text-muted-foreground/50 cursor-grab touch-none hover:bg-accent hover:text-muted-foreground active:cursor-grabbing"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <FiMove className="h-3.5 w-3.5" />
      </button>

      <button type="button" onClick={onEdit} className="min-w-0 flex-1 text-left">
        <p className="break-words text-sm font-medium leading-snug text-foreground">{task.title}</p>
        {task.description && (
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{task.description}</p>
        )}
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger
          className="shrink-0 rounded-md p-1 text-muted-foreground opacity-0 outline-none transition-opacity hover:bg-accent hover:text-foreground focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring group-hover:opacity-100"
          aria-label="Task options"
        >
          <FiMoreVertical className="h-3.5 w-3.5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={onEdit}>
            <FiEdit2 className="h-3.5 w-3.5" /> Edit
          </DropdownMenuItem>
          {otherColumns.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Move to</DropdownMenuLabel>
              {otherColumns.map((column) => (
                <DropdownMenuItem key={column.id} onSelect={() => onMoveToColumn(column.id)}>
                  <FiArrowRight className="h-3.5 w-3.5" /> {column.name}
                </DropdownMenuItem>
              ))}
            </>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem destructive onSelect={onDelete}>
            <FiTrash2 className="h-3.5 w-3.5" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.div>
  );
}